const db = require("./index");

const setupDBFunctions = async () => {
  await db.query(`
  CREATE OR REPLACE FUNCTION public.uuid_generate_v4(
    )
      RETURNS uuid
      LANGUAGE 'c'
      COST 1
      VOLATILE STRICT PARALLEL SAFE 
  AS '$libdir/uuid-ossp', 'uuid_generate_v4';
  `);
};

const setupUserTable = async () => {
  await db.query(`
    CREATE SCHEMA IF NOT EXISTS hikers;
    CREATE SEQUENCE IF NOT EXISTS user_id_seq;
    CREATE TABLE IF NOT EXISTS hikers.users
    (
        loginid TEXT NOT NULL DEFAULT (('HKR'::text || to_char((CURRENT_DATE)::timestamp with time zone, 'YYYYMMDD'::text)) || lpad((nextval('user_id_seq'::regclass))::text, 18, '0'::text)),
        username TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
        date_joined TIMESTAMPTZ,
        user_img TEXT,
        PRIMARY KEY (loginid),
        CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE (email)
    );
  `);

  await db.query("GRANT ALL ON hikers.users to postgres;");
};

const setupWalletTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS hikers.wallet
    (
        wallet_id uuid NOT NULL DEFAULT uuid_generate_v4(),
        currency character varying COLLATE pg_catalog."default" NOT NULL,
        balance DOUBLE PRECISION NOT NULL DEFAULT '0'::numeric,
        "loginid" TEXT,
        CONSTRAINT "pk_wallet" PRIMARY KEY (wallet_id),
        CONSTRAINT "fk_wallet" FOREIGN KEY ("loginid")
            REFERENCES hikers.users (loginid) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
    );
`);

  await db.query("GRANT ALL ON hikers.wallet to postgres;");
};

const setupTransactionTable = async () => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS hikers.transaction
  (
      id uuid NOT NULL DEFAULT uuid_generate_v4(),
      currency character varying COLLATE pg_catalog."default" NOT NULL,
      type character varying COLLATE pg_catalog."default" NOT NULL,
      current_price DOUBLE PRECISION NOT NULL DEFAULT '0'::numeric,
      quantity DOUBLE PRECISION NOT NULL DEFAULT '0'::numeric,
      "time" timestamp without time zone NOT NULL,
      status character varying COLLATE pg_catalog."default" NOT NULL,
      "wallet_id" uuid,
      CONSTRAINT "pk_transaction" PRIMARY KEY (id),
      CONSTRAINT "fk_transaction" FOREIGN KEY ("wallet_id")
          REFERENCES hikers.wallet (wallet_id) MATCH SIMPLE
          ON UPDATE NO ACTION
          ON DELETE NO ACTION
  )`);
};

(async () => {
  try {
    await setupDBFunctions();
  } catch (e) {
    console.log("Error setting up functions: " + e);
  }

  console.log("Setting up User table...");
  try {
    await setupUserTable();
  } catch (e) {
    console.log("Error setting up User table: " + e);
  }

  console.log("Setting up Wallet table...");
  try {
    await setupWalletTable();
  } catch (e) {
    console.log("Error setting up Wallet table: " + e);
  }

  console.log("Setting up Transaction table...");
  try {
    await setupTransactionTable();
  } catch (e) {
    console.log("Error setting up Transaction table: " + e);
  }
})();
