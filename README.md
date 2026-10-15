# Campus Repair Log

A decentralized application for reporting campus maintenance issues and tracking their resolution on the Ethereum Sepolia test network.

Users connect through MetaMask to submit repair tickets and view records stored on the blockchain. Only the coordinator—the account that deployed the contract—can mark tickets as resolved.

## Project Details

- **Course:** Blockchain Technology (CSE4444)
- **Assignment:** Assignment 2
- **Student name:** Pavan Chakrapani
- **Registration number:** 230905340

## Problem Addressed

Campus maintenance reports can be difficult to track when they are scattered across messages or recorded without a shared status history.

Campus Repair Log provides a shared record of reported issues and their resolution status. Blockchain transactions make submissions and status changes independently inspectable.

The application records what users and the coordinator submit. It does not independently verify whether a physical repair has taken place.

## Features

- Connect a MetaMask wallet.
- Check that the connected network is Ethereum Sepolia.
- Submit an issue title and location.
- Retrieve and display tickets from the blockchain.
- Show each ticket's ID, reporter address, and resolution status.
- Allow only the coordinator to resolve tickets.
- Display transaction hashes and error messages.
- Preserve ticket data across page refreshes.

## Technologies Used

| Component | Technology |
|---|---|
| Smart contract | Solidity |
| Blockchain | Ethereum Sepolia |
| Compilation and deployment | Remix IDE |
| Frontend | HTML, CSS, JavaScript |
| Blockchain interaction | Ethers.js v6 |
| Wallet | MetaMask |
| Local web server | Node.js and serve |

## Project Structure

```text
campus-repair-log-dapp/
├── CampusRepairLog.sol
├── index.html
├── style.css
├── app.js
├── README.md
└── screenshots/
```

## Smart Contract Design

### Coordinator

The constructor stores the deploying account's address as the coordinator. This address is immutable, so it cannot be changed after deployment.

### Ticket Data

Each ticket stores:

- Issue title
- Location
- Reporter wallet address
- Resolution status
- Creation timestamp

Ticket IDs begin at `0`.

### Functions

| Function | Purpose | Access |
|---|---|---|
| `coordinator()` | Returns the coordinator's address | Anyone |
| `createTicket(title, location)` | Creates a repair ticket | Any account |
| `ticketCount()` | Returns the total number of tickets | Anyone |
| `getTicket(id)` | Returns a ticket's stored details | Anyone |
| `resolveTicket(id)` | Marks an existing open ticket as resolved | Coordinator only |

### Validation

- Titles must contain between 3 and 80 bytes.
- Locations must contain between 3 and 80 bytes.
- Ticket IDs must refer to existing tickets.
- Only the coordinator can resolve a ticket.
- A resolved ticket cannot be resolved again.

String validation uses UTF-8 byte length, which may differ from character count for non-ASCII text.

### Events

- `TicketCreated`: emitted when a ticket is created.
- `TicketResolved`: emitted when a ticket is resolved.

## Deployment Details

| Item | Value |
|---|---|
| Network | Ethereum Sepolia |
| Chain ID | `11155111` |
| Contract address | `0x08DBE5b5f1dB0f4E97273657f002F468A415a979` |
| Coordinator address | `0x9A78A6Ab890d4327926e8EE16E2d2909cf5B7ceB` |
| Solidity compiler version | `0.8.23` |
| Deployment transaction hash | `0x3f438ad096ea335078142792218a08659fa1f631d08ea7759ee0daf0f5d61acd` |

Contract explorer link:

https://sepolia.etherscan.io/address/0x08DBE5b5f1dB0f4E97273657f002F468A415a979

## Run the Frontend

### Prerequisites

- Node.js and npm installed
- MetaMask installed in the browser
- A MetaMask account connected to Sepolia
- Sepolia test ETH for transactions
- Internet access to load Ethers.js and communicate with Sepolia

### Instructions

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Check that `CONTRACT_ADDRESS` in `app.js` matches the deployed contract address.
4. Open a terminal in the project folder.
5. Start the local server:

   ```bash
   npx serve .
   ```

   If Windows PowerShell blocks `npx.ps1`, use:

   ```powershell
   npx.cmd serve .
   ```

6. Open the Local URL printed in the terminal.
7. Click **Connect MetaMask**.
8. Approve the account connection and select **Sepolia for this website** in MetaMask.
9. Click **Connect MetaMask** again if necessary.

Keep the terminal running while using the application. Press `Ctrl + C` to stop the server.

## Interact With the Application

### Create a Ticket

1. Connect MetaMask.
2. Enter an issue and location, for example:
   - Issue: `Broken classroom projector`
   - Location: `Academic block room 201`
3. Click **Create ticket**.
4. Confirm the transaction in MetaMask.
5. Wait for confirmation and check that the ticket appears.

### Resolve a Ticket

1. Connect the account that deployed the contract.
2. Click **Mark resolved** beside an open ticket.
3. Confirm the transaction in MetaMask.
4. Wait for the ticket's status to change to **Resolved**.

The frontend displays the resolution button only for the coordinator. The contract independently enforces the same permission.

### Retrieve Blockchain Data

Click **Refresh tickets** to reload ticket data. After refreshing the browser and reconnecting, previously saved tickets remain available.

Reading ticket data does not require a transaction fee. Creating or resolving a ticket requires Sepolia test ETH for gas.

## Compile and Deploy Your Own Instance

1. Open https://remix.ethereum.org/.
2. Create `CampusRepairLog.sol` and paste the contract source.
3. Compile using a Solidity version compatible with `^0.8.20`.
4. Open **Deploy & Run Transactions**.
5. Select the MetaMask / Injected Provider environment.
6. Confirm that Remix is connected to Sepolia and the intended deploying account.
7. Select `CampusRepairLog` and keep **Value** at `0`.
8. Click **Deploy** and confirm in MetaMask.
9. Wait for confirmation and copy the deployed contract address.
10. Replace `CONTRACT_ADDRESS` in `app.js` with the new address.

There are no constructor arguments. The account used for deployment becomes the coordinator.

## Testing

| Test | Input or action | Expected result | Observed result |
|---|---|---|---|
| Valid ticket creation | Submit a valid issue and location | Ticket stored and count increases | Ticket created successfully |
| Blockchain data retrieval | Read tickets through the frontend | Stored ticket details displayed | Ticket details displayed |
| Authorized resolution | Coordinator resolves an open ticket | Status becomes Resolved | Ticket resolved successfully |
| Persistence | Refresh browser and reconnect | Saved ticket state remains available | Saved ticket remained visible |
| Invalid input | Call `createTicket("AB", "Library")` | Rejected: `Title must be 3 to 80 bytes` | Title needs to be between 3 and 80 characters in length |
| Unauthorized resolution | Account 2 calls `resolveTicket(0)` | Rejected: `Coordinator only` | Call rejected with `Coordinator only` |

For the unauthorized test, the caller's address was verified to differ from the address returned by `coordinator()`.

An error rejected during gas estimation is a rejected call, not a mined failed transaction. Such a call has no on-chain transaction hash.

## Transaction Evidence

| Action | Transaction hash |
|---|---|
| Contract deployment | `0x3f438ad096ea335078142792218a08659fa1f631d08ea7759ee0daf0f5d61acd` |
| Successful ticket creation | `0xb9b911ca5aaa2f9eb0bee51c74eb952b63052e579395b7a1be4f83f15fa69852` |
| Successful ticket resolution | `0x0f83be412afbba64d4ff89978e37e144070e9a946bdb293ed3c228c8f416ec10` |

Transactions can be inspected using:

```text
https://sepolia.etherscan.io/tx/TRANSACTION_HASH
```

## Screenshots

### Successful Compilation
![Successful compilation](<screenshots/Successful Compilation.png>)

### Contract Deployment
![Contract deployment](<screenshots/Successfully Deployed.png>)

### MetaMask Connection
![Connected wallet](<screenshots/Wallet Connected.png>)

### Successful Transaction
![Transaction input](<screenshots/Input Valid Transaction.png>)

![Successful transaction](<screenshots/Successful Transaction.png>)

### Blockchain Data of Successful Transaction
![Ticket data - 1](<screenshots/Blockchain Data - 1 for valid Transaction.png>)

![Ticket data - 2](<screenshots/Blockchain Data - 2 for valid Transaction.png>)

### Invalid Input
![Invalid input rejection](<screenshots/Invalid TestCase.png>)

### Unauthorized Call
![Coordinator address](<screenshots/Coordinator.png>)

![Account 2 address](<screenshots/Invalid Account.png>)

![Unauthorized call rejection](<screenshots/Unauthorized - 3.png>)

## Security and Limitations

- Private keys and recovery phrases are managed by MetaMask and are not included in the application.
- Authorization is enforced by the smart contract, not only by the interface.
- Ticket information is public. Personal or sensitive information should not be submitted.
- The coordinator controls resolution decisions.
- The application does not verify that reported issues or completed repairs are genuine.
- The frontend loads tickets individually and is intended for a small assignment demonstration.
- This project is deployed on Sepolia for educational testing.
