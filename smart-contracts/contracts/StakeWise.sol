// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract StakeWise is Ownable, AutomationCompatible {
    enum Prediction {
        LessThanRange1,
        BetweenRange1AndRange2,
        BetweenRange2AndRange3,
        BetweenRange3AndRange4,
        GreaterThanRange4
    }

    struct Bet {
        uint256 amount;
        Prediction prediction;
        uint256 timestamp;
        bool resolved;
        bool won;
    }

    struct Market {
        AggregatorV3Interface priceFeed;
        int256[] ranges; // Array of price ranges
        uint256 interval;
        uint256 lastTimeStamp;
        bool active;
        address[] betAddresses;
        mapping(address => Bet) bets;
    }

    mapping(string => Market) public markets;
    string[] private marketNames;  // Array to keep track of market names
    mapping(address => uint256) public collaterals;
    mapping(address => uint256) public borrowedAmounts;
    uint256 public constant MAX_BET_AMOUNT = 1000000000000000; // 0.001 ETH
    bool public distributingPrizes = false;

    event BetPlaced(address indexed user, uint256 amount, Prediction prediction, string market);
    event BetResolved(address indexed user, bool won, string market);
    event MarketAdded(string market, address priceFeed);
    event MarketUpdated(string market, address priceFeed);
    event AmountBorrowed(address indexed user, uint256 amount);
    event BorrowedAmountRepaid(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) AutomationCompatible() {}

    function addMarket(
        string memory market,
        address priceFeed,
        int256[] memory ranges,
        uint256 interval
    ) public onlyOwner {
        require(address(markets[market].priceFeed) == address(0), "Market already exists");
        require(ranges.length == 4, "Exactly 4 ranges must be provided");

        Market storage newMarket = markets[market];
        newMarket.priceFeed = AggregatorV3Interface(priceFeed);
        newMarket.ranges = ranges;
        newMarket.interval = interval;
        newMarket.lastTimeStamp = block.timestamp;
        newMarket.active = true;

        marketNames.push(market);

        emit MarketAdded(market, priceFeed);
    }

    function updateMarket(
        string memory market,
        address priceFeed,
        int256[] memory ranges,
        uint256 interval
    ) public onlyOwner {
        require(address(markets[market].priceFeed) != address(0), "Market does not exist");
        require(ranges.length == 4, "Exactly 4 ranges must be provided");

        Market storage existingMarket = markets[market];
        existingMarket.priceFeed = AggregatorV3Interface(priceFeed);
        existingMarket.ranges = ranges;
        existingMarket.interval = interval;

        emit MarketUpdated(market, priceFeed);
    }

    function placeBet(string memory market, Prediction prediction, uint256 useBorrowedAmount) public payable {
        require(!distributingPrizes, "Betting is temporarily disabled during prize distribution");
        Market storage mkt = markets[market];
        require(mkt.active, "Market is not active");

        uint256 totalBetAmount = msg.value + useBorrowedAmount;
        require(totalBetAmount > 0, "Bet amount must be greater than zero");
        require(totalBetAmount <= MAX_BET_AMOUNT, "Bet amount must not exceed 0.001 ETH");

        if (useBorrowedAmount > 0) {
            require(borrowedAmounts[msg.sender] >= useBorrowedAmount, "Insufficient borrowed funds");
            borrowedAmounts[msg.sender] -= useBorrowedAmount;
        }

        Bet memory newBet = Bet({
            amount: totalBetAmount,
            prediction: prediction,
            timestamp: block.timestamp,
            resolved: false,
            won: false
        });

        mkt.bets[msg.sender] = newBet;
        collaterals[msg.sender] += totalBetAmount; // Update collateral based on the bet amount
        mkt.betAddresses.push(msg.sender);

        emit BetPlaced(msg.sender, totalBetAmount, prediction, market);
    }

    function borrowAgainstCollateral(uint256 percentage) public {
        require(percentage > 0 && percentage <= 100, "Invalid percentage");
        uint256 collateral = (collaterals[msg.sender] * percentage) / 100;
        require(collateral > 0, "No collateral available");

        borrowedAmounts[msg.sender] += collateral;
        collaterals[msg.sender] -= collateral;

        emit AmountBorrowed(msg.sender, collateral);
    }

    function repayBorrowedAmount(uint256 amount) public payable {
        require(amount > 0 && amount <= borrowedAmounts[msg.sender], "Invalid amount");

        borrowedAmounts[msg.sender] -= amount;
        collaterals[msg.sender] += msg.value;

        emit BorrowedAmountRepaid(msg.sender, amount);
    }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        upkeepNeeded = false;
        for (uint256 i = 0; i < marketNames.length; i++) {
            Market storage mkt = markets[marketNames[i]];
            if ((block.timestamp - mkt.lastTimeStamp) > mkt.interval) {
                upkeepNeeded = true;
                break;
            }
        }
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        for (uint256 i = 0; i < marketNames.length; i++) {
            Market storage mkt = markets[marketNames[i]];
            if ((block.timestamp - mkt.lastTimeStamp) > mkt.interval) {
                distributePrizes(marketNames[i]);
                mkt.lastTimeStamp = block.timestamp;
            }
        }
    }

    function distributePrizes(string memory market) internal {
        distributingPrizes = true;
        Market storage mkt = markets[market];
        int256 latestPrice = getLatestPrice(mkt.priceFeed);

        uint256 prizePool = address(this).balance;
        uint256 totalWinningBets = 0;

        // Calculate the total amount of winning bets
        for (uint256 i = 0; i < mkt.betAddresses.length; i++) {
            address user = mkt.betAddresses[i];
            Bet storage userBet = mkt.bets[user];
            if (!userBet.resolved && checkBetOutcome(userBet.prediction, latestPrice, mkt)) {
                totalWinningBets += userBet.amount;
            }
        }

        for (uint256 i = 0; i < mkt.betAddresses.length; i++) {
            address user = mkt.betAddresses[i];
            Bet storage userBet = mkt.bets[user];
            if (!userBet.resolved) {
                bool won = checkBetOutcome(userBet.prediction, latestPrice, mkt);
                userBet.resolved = true;
                userBet.won = won;

                if (won) {
                    uint256 prize = calculatePrize(userBet.amount, prizePool, totalWinningBets);
                    payable(user).transfer(prize);
                } else {
                    // Retrieve borrowed amount and staked amount if the user loses
                    uint256 totalLoss = userBet.amount + borrowedAmounts[user];
                    require(address(this).balance >= totalLoss, "Insufficient contract balance");
                    borrowedAmounts[user] = 0;
                    collaterals[user] -= userBet.amount;
                }

                emit BetResolved(user, won, market);
            }
        }

        // Clear resolved bets
        delete mkt.betAddresses;
        distributingPrizes = false;
    }

    function getLatestPrice(AggregatorV3Interface priceFeed) public view returns (int256) {
        (
            /*uint80 roundID*/,
            int256 price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function checkBetOutcome(Prediction prediction, int256 price, Market storage mkt) internal view returns (bool) {
        if (prediction == Prediction.LessThanRange1 && price < mkt.ranges[0] * 10**8) {
            return true;
        }
        if (prediction == Prediction.BetweenRange1AndRange2 && price >= mkt.ranges[0] * 10**8 && price <= mkt.ranges[1] * 10**8) {
            return true;
        }
        if (prediction == Prediction.BetweenRange2AndRange3 && price >= mkt.ranges[1] * 10**8 && price <= mkt.ranges[2] * 10**8) {
            return true;
        }
        if (prediction == Prediction.BetweenRange3AndRange4 && price >= mkt.ranges[2] * 10**8 && price <= mkt.ranges[3] * 10**8) {
            return true;
        }
        if (prediction == Prediction.GreaterThanRange4 && price > mkt.ranges[3] * 10**8) {
            return true;
        }
        return false;
    }
    function calculatePrize(
        uint256 amount,
        uint256 prizePool,
        uint256 totalWinningBets
    ) internal pure returns (uint256) {
        if (totalWinningBets == 0) {
            return 0;
        }
        // Calculate the prize proportionally based on the bet amount and total winning bets
        return (amount * prizePool) / totalWinningBets;
    }
}
