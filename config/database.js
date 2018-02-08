module.exports = {
  url: process.env.DATABASE_URL,
  options: {
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    logging: false
  }
};
