// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract CampusRepairLog
{
    address public immutable coordinator;
    struct Ticket
    {
        string title;
        string location;
        address reporter;
        bool resolved;
        uint256 createdAt;
    }

    Ticket[] private tickets;

    event TicketCreated(uint256 indexed id, address indexed reporter);
    event TicketResolved(uint256 indexed id, address indexed coordinator);

    constructor() 
    {
        coordinator = msg.sender;
    }

    function createTicket(string calldata title, string calldata location)external
    {
        require(
            bytes(title).length >= 3 && bytes(title).length <= 80, "Title must be between 3 and 80 characters"
        );

        require(
            bytes(location).length >= 3 && bytes(location).length <= 80, "Location must be between 3 and 80 characters"
        );

        uint256 id = tickets.length;
        tickets.push(
            Ticket({
                title: title,
                location: location,
                reporter: msg.sender,
                resolved: false,
                createdAt: block.timestamp
            })
        );

        emit TicketCreated(id, msg.sender);
    }

    function resolveTicket(uint256 id)external 
    {
        require(msg.sender == coordinator, "Coordinator only");
        require(id < tickets.length, "Ticket does not exist");
        require(!tickets[id].resolved, "Ticket already resolved");

        tickets[id].resolved = true;
        emit TicketResolved(id, msg.sender);
    }

    function ticketCount() external view returns (uint256)
    {
        return tickets.length;
    }

    function getTicket(uint256 id)external view returns (
        string memory title,
        string memory location,
        address reporter,
        bool resolved, 
        uint256 createdAt
    )
    {
        require(id < tickets.length, "Ticket does not exist");
        Ticket storage ticket = tickets[id];
        return(
            ticket.title, 
            ticket.location,
            ticket.reporter,
            ticket.resolved,
            ticket.createdAt
        );
    }
}