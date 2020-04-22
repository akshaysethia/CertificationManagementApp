trigger CheckingDuplicates on Certification_Request__c (before insert) {
    if ( Trigger.isInsert ) {
        for ( Certification_Request__c obj : Trigger.new ) {
            if ( obj.Voucher__c != NULL ) {
                List<Certification_Request__c> apk = [SELECT Certification__c, Voucher__c FROM Certification_Request__c WHERE Certification__c =: obj.Certification__c AND Voucher__c =: obj.Voucher__c];
                if ( !apk.isEmpty() ) {
                    obj.addError('Cannot Use Same Certification and Voucher Details Again, Request Already Pending !');
                }
            }
        }
    }
}