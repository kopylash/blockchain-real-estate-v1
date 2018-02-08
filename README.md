# Blockchain real-estate app

Proof of concept of a hybrid real-estate app with blockchain and Ethereum smart contracts.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You need Node.js >= 8.0.0.

Install [Truffle](http://truffleframework.com/)

```
npm install -g truffle
```

Install [Ganache](http://truffleframework.com/ganache/) or [ganache-cli](https://github.com/trufflesuite/ganache-cli) to run local Ethereum blockchain.

```
npm install -g ganache-cli
```

### Installing

Clone the repo

```
git clone https://github.com/kopylash/blockchain-real-estate-v1.git
```

Install dependencies

```
npm install
```

### Run

Before starting the app start local ethereum blockchain with Ganache. 
For this either open Ganache app or run ganache-cli.

```
ganache-cli
```

Compile smart contracts.

```
cd ethereum/
truffle compile
```

Deploy the contracts onto your network of choice (default "development").
Check [Truffle docs](http://truffleframework.com/docs/) for details.

```
truffle migrate
```

Then run server with 

```
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



