import { ethers } from
  "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

const CONTRACT_ADDRESS = "0x08DBE5b5f1dB0f4E97273657f002F468A415a979";
const SEPOLIA_CHAIN_ID = 11155111n;

const ABI = [
  "function coordinator() view returns (address)",
  "function ticketCount() view returns (uint256)",
  "function getTicket(uint256 id) view returns (string title, string location, address reporter, bool resolved, uint256 createdAt)",
  "function createTicket(string title, string location)",
  "function resolveTicket(uint256 id)"
];

const connectButton = document.querySelector("#connectButton");
const refreshButton = document.querySelector("#refreshButton");
const form = document.querySelector("#ticketForm");
const accountText = document.querySelector("#account");
const statusText = document.querySelector("#status");
const ticketsElement = document.querySelector("#tickets");

let provider;
let signer;
let contract;
let account;
let coordinator;

function showError(error) {
  statusText.textContent =
    error.shortMessage || error.reason || error.message || String(error);
}

async function connect() {
  if (!window.ethereum) {
    statusText.textContent = "Install MetaMask to use this app.";
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const network = await provider.getNetwork();
    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      statusText.textContent = "Select Sepolia in MetaMask, then connect again.";
      return;
    }

    signer = await provider.getSigner();
    account = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    coordinator = await contract.coordinator();

    accountText.textContent = `Connected: ${account}`;
    statusText.textContent = "Connected to Sepolia.";
    await refreshTickets();
  } catch (error) {
    showError(error);
  }
}

async function refreshTickets() {
  if (!contract) {
    statusText.textContent = "Connect MetaMask first.";
    return;
  }

  try {
    ticketsElement.replaceChildren();
    const count = await contract.ticketCount();

    if (count === 0n) {
      ticketsElement.textContent = "No tickets yet.";
      return;
    }

    for (let id = count - 1n; id >= 0n; id--) {
      const ticket = await contract.getTicket(id);
      const card = document.createElement("article");
      card.className = "ticket";

      const heading = document.createElement("h3");
      heading.textContent = `#${id} — ${ticket.title}`;
      card.append(heading);

      const details = document.createElement("p");
      details.textContent =
        `${ticket.location} · ${ticket.resolved ? "Resolved" : "Open"} · ` +
        `Reported by ${ticket.reporter}`;
      card.append(details);

      if (!ticket.resolved &&
          account.toLowerCase() === coordinator.toLowerCase()) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Mark resolved";
        button.addEventListener("click", async () => {
          try {
            statusText.textContent = "Confirm resolution in MetaMask...";
            const tx = await contract.resolveTicket(id);
            statusText.textContent = `Waiting for transaction ${tx.hash}`;
            await tx.wait();
            statusText.textContent = `Resolved ticket #${id}. Tx: ${tx.hash}`;
            await refreshTickets();
          } catch (error) {
            showError(error);
          }
        });
        card.append(button);
      }

      ticketsElement.append(card);

      if (id === 0n) break;
    }
  } catch (error) {
    showError(error);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!contract) {
    statusText.textContent = "Connect MetaMask first.";
    return;
  }

  try {
    const title = document.querySelector("#title").value.trim();
    const location = document.querySelector("#location").value.trim();

    statusText.textContent = "Confirm ticket creation in MetaMask...";
    const tx = await contract.createTicket(title, location);
    statusText.textContent = `Waiting for transaction ${tx.hash}`;
    await tx.wait();

    form.reset();
    statusText.textContent = `Ticket created. Tx: ${tx.hash}`;
    await refreshTickets();
  } catch (error) {
    showError(error);
  }
});

connectButton.addEventListener("click", connect);
refreshButton.addEventListener("click", refreshTickets);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}