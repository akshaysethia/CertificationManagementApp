trigger AutoVoucher on Certification_Request__c (after update) {
    if (Trigger.isAfter) {
        string act = 'True';
        List<Certification_Request__c> req = new List<Certification_Request__c>([ SELECT Certification__c, Voucher__c, Status__c FROM Certification_Request__c ]);
        if ( !req.isEmpty() ) {
            for ( Certification_Request__c i : req ) {
                if (i.Status__c == 'Approved' && i.Voucher__c == NUll) {
                    List<Voucher__c> vouch = new List<Voucher__c>([ SELECT Id, Active__c FROM Voucher__c WHERE Certification__c =: i.Certification__c AND Active__c =: act]);
                    if ( !vouch.isEmpty() ) {
                        i.Voucher__c = vouch[0].Id;
                        upsert i;
                    }
                } 
            }
        }
    }
}