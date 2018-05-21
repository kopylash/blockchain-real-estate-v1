# Blockchain real-estate app

Proof of concept of a hybrid real-estate app with blockchain and Ethereum smart contracts.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
See deployment for notes on how to deploy the project on a live system.

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

### Database
We use [Sequelize](http://docs.sequelizejs.com/) for database manipulation.
Project is preconfigured to use PostgreSQL.
To connect to the database setup environmental variable **DATABASE_URL** in format:

```
DATABASE_URL = "postgres://<user>:<password>@<host>:<port>/<database_name>"
```

**IMPORTANT:** Postgres should have [POSTGIS](https://postgis.net/) extension installed.
And you should enable it in your database by running:

```sql
CREATE EXTENSION POSTGIS;
```

Database is automatically synchronized with Models definition.

### Run

Before starting the app start local ethereum blockchain with Ganache. 
For this either open Ganache app or run:

```
npm run start:eth
```

NOTE: we use next mnemonic for development purposes, some configs are predefined.
```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
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
## API
The complete API reference is published to [Postman](https://documenter.getpostman.com/view/2429710/blockhain-real-estate-v1/RW81vZ4a).
You can import it and use for testing.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



