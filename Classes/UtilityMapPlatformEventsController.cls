public with sharing class UtilityMapPlatformEventsController {
    // Publishes platform events for updated utility service locations
    public static void publishUtilityUpdate(List<sObject> utilityList, String type, String operation) {
        try {
            List<Agent_Service__e > events = new List<Agent_Service__e>();

            if (utilityList == null || utilityList.isEmpty()) {
                System.debug('Error: Empty or null utility list passed to publishUtilityUpdate.');
                return;
            }

            if (type == 'Contact') {
                for (sObject obj : utilityList) {
                    if (obj instanceof Contact) {
                        Contact con = (Contact) obj;
                        events.add(new Agent_Service__e(
                            Id__c = con.Id,
                            Name__c = con.FirstName+' '+con.LastName,
                            MailingStreet__c= con.MailingStreet,
                            MailingCity__c= con.MailingCity,
                            MailingCountry__c= con.MailingCountry,
                            Operation__c=operation
                        ));
                    }
                }
            }

            if (!events.isEmpty()) {
                EventBus.publish(events);
            } else {
                System.debug('No events to publish.');
            }
        } catch (Exception e) {
            System.debug('Error in publishUtilityUpdate: ' + e.getMessage());
        }
    }
}