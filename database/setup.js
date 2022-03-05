const db = require("./index");
const { db_user } = require("./config");

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
        -- CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE (email)
    );
    `);

  await db.query("GRANT ALL ON hikers.users to postgres;");
};

const setupWalletTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS hikers.wallet
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        currency character varying COLLATE pg_catalog."default" NOT NULL,
        balance numeric(8,0) NOT NULL DEFAULT '0'::numeric,
        "loginid" TEXT,
        CONSTRAINT "pk_wallet" PRIMARY KEY (id),
        CONSTRAINT "fk_wallet" FOREIGN KEY ("loginid")
            REFERENCES hikers.users (loginid) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
    )
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
      current_price numeric(8,0) NOT NULL DEFAULT '0'::numeric,
      quantity numeric(8,0) NOT NULL DEFAULT '0'::numeric,
      "time" timestamp without time zone NOT NULL,
      status character varying COLLATE pg_catalog."default" NOT NULL,
      "walletId" uuid,
      CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY (id),
      CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d" FOREIGN KEY ("walletId")
          REFERENCES hikers.wallet (id) MATCH SIMPLE
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

  console.log("Setting up Users table...");
  try {
    await setupUserTable();
  } catch (e) {
    console.log("Error setting up Users table: " + e);
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
