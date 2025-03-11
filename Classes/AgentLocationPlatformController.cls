public class AgentLocationPlatformController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactLocations() {
        try {
            System.debug('Fetching agent locations...');
            return [SELECT Id,Name,MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, MailingLatitude, MailingLongitude 
            FROM Contact where MailingCountry != null WITH USER_MODE Order by CreatedDate DESC limit 11];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching agent locations: ' + e.getMessage());
        }
    }

    public static void publishLocationEvent(List<Contact> contacts, String eventType) {
        if (contacts == null || contacts.isEmpty()) {
            throw new AuraHandledException('No agents provided for ' + eventType + ' event.');
        }
        try {
        } catch (Exception e) {
            throw new AuraHandledException('Error publishing location events: ' + e.getMessage());
        }
    }
}