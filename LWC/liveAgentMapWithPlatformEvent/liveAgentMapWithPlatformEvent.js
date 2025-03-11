import { LightningElement, track, wire } from 'lwc';
import { subscribe, unsubscribe } from 'lightning/empApi'; // Import methods to subscribe and unsubscribe from platform events
import getContactLocations from '@salesforce/apex/AgentLocationPlatformController.getContactLocations'; // Apex method to fetch initial agent locations
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // Import for toast notifications

export default class LiveAgentMapWithPlatformEvent extends LightningElement {
    @track mapMarkers = []; // Stores the map markers for agent locations
    @track subscription = null; // Stores the subscription reference for platform events
    channelName = '/event/Agent_Service__e'; // Platform event channel to subscribe to
    @track center;
    @track selectedMarkerValue={};
    // Fetch initial agent locations using Apex method
    @wire(getContactLocations)
    wiredContacts({ error, data }) {
        if (data) {
            this.updateMarkers(data); // Update the map markers with fetched data
        } else if (error) {
            this.showToast('Error', 'Failed to fetch agent locations', 'error'); // Show error toast if data fetching fails
        }
    }

    // Subscribe to platform events when the component is connected
    connectedCallback() {
        this.subscribeToEvent();
    }
    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
        console.log(this.selectedMarkerValue);
        this.center = {location: { Street: this.selectedMarkerValue},};
        //center
    }
    // Method to subscribe to the platform event channel
    subscribeToEvent() {
        subscribe(this.channelName, -1, (message) => {
            this.handlePlatformEvent(message); // Handle incoming platform events
        }).then(response => {
            this.subscription = response; // Store the subscription reference
            this.showToast('Success', 'Subscribed to location updates', 'success'); // Show success toast on subscription
        }).catch(error => {
            this.showToast('Error', 'Failed to subscribe to updates', 'error'); // Show error toast on subscription failure
        });
    }

    // Update map markers with agent location data
    updateMarkers(contacts) {
        this.mapMarkers = contacts.map(con => ({
            Id: con.Id,
            location: {
                Street: con.MailingStreet,
                City: con.MailingCity,
                Country: con.MailingCountry
            },
            // For onmarkerselect
            value: con.MailingStreet,
            title: con.Name,
            description: `Contact: <b>${con.Name}</b>` // Display agent name in marker description
        }));
    }

    // Handle incoming platform event messages
    handlePlatformEvent(message) {
        const eventData = message.data.payload;
        console.log('eventData ',JSON.stringify(eventData));
        const eventType = eventData.Operation__c; // Extract event type (Update, Delete, Undelete)
        // Handle different event types
        if (eventType === 'Delete') {
            // Remove the marker if the agent is deleted
            this.mapMarkers = this.mapMarkers.filter(item => item.Id !== eventData.Id__c);
            this.showToast('Warning', `Location removed for ${eventData.Name__c}`, 'warning'); // Show warning message
        }else{
            // Construct the updated marker object
            const updatedMarker = {
                Id: eventData.Id__c,
                location: {
                    Name:eventData.Name__c,
                    Street: eventData.MailingStreet__c,
                    City: eventData.MailingCity__c,
                    Country: eventData.MailingCountry__c
                },
                // For onmarkerselect
                value: eventData.MailingStreet__c,
                title: eventData.Name__c,
                description: `Contact: <b>${eventData.Name__c}</b>` // Display updated agent name in marker
            };
            // Check if the agent already exists in the map markers
            const index = this.mapMarkers.findIndex(m => m.Id === eventData.Id__c);
            if (index !== -1) {
                // Update existing marker
                this.mapMarkers[index] = updatedMarker;
                this.mapMarkers = [...this.mapMarkers]; // Refresh map markers array
            } else {
                // Add new marker
                this.mapMarkers = [...this.mapMarkers, updatedMarker];
            }
            this.showToast('Success', `Location updated for ${eventData.Name__c}`, 'info'); // Show success message
        }
    }

    // Unsubscribe from platform events when the component is disconnected
    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription, (response) => {
                this.showToast('Success', 'Unsubscribed from location updates', 'success'); // Show success toast on unsubscription
            }).catch(error => {
                this.showToast('Error', 'Failed to unsubscribe', 'error'); // Show error toast if unsubscription fails
            });
            this.subscription = null; // Clear the subscription reference
        }
    }

    // Utility method to show toast notifications
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event); // Dispatch toast event
    }
}