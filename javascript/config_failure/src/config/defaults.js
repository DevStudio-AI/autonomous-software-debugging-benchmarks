/**
 * Default Configuration Values
 * 
 * in the loader, so explicit env vars get ignored
 */

module.exports = {
    database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp_dev',
        user: 'postgres',
        password: '',
        ssl: false,
        pool: {
            min: 2,
            max: 10
        }
    },
    migrations: {
        directory: './migrations',
        tableName: 'migrations',
        extension: '.js'
    },
    logging: {
        level: 'info',
        format: 'pretty'
    }
};
