import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import getVoucherList from '@salesforce/apex/Fetchdata.vouData';

import VouId from '@salesforce/schema/Voucher__c.Id';
import VouName from '@salesforce/schema/Voucher__c.Voucher_Name__c';
import VouCost from '@salesforce/schema/Voucher__c.Voucher_Cost__c';
import VouVal from '@salesforce/schema/Voucher__c.Validity__c';
import VouAct from '@salesforce/schema/Voucher__c.Active__c';
import VouCert from '@salesforce/schema/Voucher__c.Certification__c';
import VouCom from '@salesforce/schema/Voucher__c.Comments__c';

const actions = [
    { label: 'Record Details', name: 'record_details' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];

const columns = [
    { label: 'Voucher Id', fieldName: 'Name' },
    { label: 'Voucher Name', fieldName: 'Voucher_Name__c' },
    { label: 'Voucher Cost', fieldName: 'Voucher_Cost__c', type: 'currency', typeAttributes: { currencyCode: 'INR' }, cellAttributes: { alignment: 'left' } },
    { label: 'Voucher Validity', fieldName: 'Validity__c' },
    { label: 'Active', fieldName: 'Active__c' },
    { label: 'Certification Name', fieldName: 'Certification__c', type: 'text' },
    { label: 'Voucher Comments', fieldName: 'Comments__c' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
        }
    }
];

export default class VoucherOperations extends LightningElement {

    fields = [VouName, VouCost, VouVal, VouAct, VouCert, VouCom];

    handleSuccess(event) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Voila',
            message: 'Voucher Created !',
            variant: 'success'
        }));
        location.reload();
    }

    @track vouchers;
    @track columns = columns;
    @track record;
    @track currentRecordId;
    @track isEditForm = false;
    @track bShowModal = false;

    error;
    refreshTable;

    @wire(getVoucherList)
    Voucher__c(result) {
        this.refreshTable = result;
        if (result.data) {
            let values = [];
            result.data.forEach(request => {
                let value = {};
                value.Name = request.Name;
                value.Voucher_Name__c = request.Voucher_Name__c;
                value.Voucher_Cost__c = request.Voucher_Cost__c;
                value.Validity__c = request.Validity__c;
                value.Active__c = request.Active__c;
                value.Certification__c = request.Certification__r.Cert_Name__c;
                value.Comments__c = request.Comments__c;
                values.push(value);
            });
            this.vouchers = values;
            this.error = undefined;
        } else if (result.error) {
            this.vouchers = undefined;
            this.error = result.error;
        }

        if (this.error != undefined) {
            console.log(this.error);
        } else {
            console.log(result.data);
        }
    }

    handleRowActions(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;

        switch (actionName) {
            case 'record_details':
                this.viewVou(row);
                break;
            case 'edit':
                this.editCurrVou(row);
                break;
            case 'delete':
                this.deleteVou(row);
                break;
        }
    }

    viewVou(currRow) {
        this.bShowModal = true;
        this.isEditForm = false;
        this.record = currRow;
    }

    closeModal() {
        this.bShowModal = false;
    }

    editCurrVou(currRow) {
        this.bShowModal = true;
        this.isEditForm = true;
        this.currentRecordId = currRow.Id;
    }

    handleSubmit(event) {
        console.log("Update method called !");
        this.bShowModal = false;
        this.isEditForm = false;

        const fields = {};
        fields[VouId.fieldApiName] = this.currentRecordId;
        fields[VouName.fieldApiName] = event.detail.fields.Voucher_Name__c;
        fields[VouCost.fieldApiName] = event.detail.fields.Voucher_Cost__c;
        fields[VouVal.fieldApiName] = event.detail.fields.Validity__c;
        fields[VouAct.fieldApiName] = event.detail.fields.Active__c;
        fields[VouCert.fieldApiName] = event.detail.fields.Certification__c;
        fields[VouCom.fieldApiName] = event.detail.fields.Comments__c;
        console.log(fields);

        const recordInp = { fields };

        updateRecord(recordInp).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Voucher Updated !',
                variant: 'success'
            }));
            return refreshApex(this.refreshTable);
        }).catch(err => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error updating Voucher !',
                variant: 'error'
            }));
            console.log('Error aa gaya Bhaiyo');
        });
    }

    deleteVou(currRow) {
        deleteRecord(currRow.Id).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Deleted',
                message: 'Voucher Deleted Successfully !',
                variant: 'success'
            }));
            return refreshApex(this.refreshTable);
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Voucher could not be Deleted !',
                variant: 'error'
            }));
        });
    }

}