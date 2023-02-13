near-blank-project
==================

This app was initialized with [create-near-app]

    npx create-near-app

Quick Start
===========

If you haven't installed dependencies during setup:

    npm install


Build and deploy your contract to TestNet with a temporary dev account:

    npm run deploy

Test your contract:

    npm test

If you have a frontend, run `npm start`. This will run a dev server.


Exploring The Code
==================

1. The smart-contract code lives in the `/contract` folder. See the README there for
   more info. In blockchain apps the smart contract is the "backend" of your app.
2. The frontend code lives in the `/frontend` folder. `/frontend/index.html` is a great
   place to start exploring. Note that it loads in `/frontend/index.js`,
   this is your entrypoint to learn how the frontend connects to the NEAR blockchain.
3. Test your contract: `npm test`, this will run the tests in `integration-tests` directory.


Deploy
======

Every smart contract in NEAR has its [own associated account][NEAR accounts]. 
When you run `npm run deploy`, your smart contract gets deployed to the live NEAR TestNet with a temporary dev account.
When you're ready to make it permanent, here's how:


Step 0: Install near-cli (optional)
-------------------------------------

[near-cli] is a command line interface (CLI) for interacting with the NEAR blockchain. It was installed to the local `node_modules` folder when you ran `npm install`, but for best ergonomics you may want to install it globally:

    npm install --global near-cli

Or, if you'd rather use the locally-installed version, you can prefix all `near` commands with `npx`

Ensure that it's installed with `near --version` (or `npx near --version`)


Step 1: Create an account for the contract
------------------------------------------

Each account on NEAR can have at most one contract deployed to it. If you've already created an account such as `your-name.testnet`, you can deploy your contract to `near-blank-project.your-name.testnet`. Assuming you've already created an account on [NEAR Wallet], here's how to create `near-blank-project.your-name.testnet`:

1. Authorize NEAR CLI, following the commands it gives you:

      near login