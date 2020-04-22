import { LightningElement, wire, track } from 'lwc';
import { createRecord, deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getCertList from '@salesforce/apex/Fetchdata.certData';
import Cert_Object from '@salesforce/schema/Certification__c';
import CertId from '@salesforce/schema/Certification__c.Id';
import CertName from '@salesforce/schema/Certification__c.Cert_Name__c';
import CertComm from '@salesforce/schema/Certification__c.Comments__c';

const actions = [
    { label: 'Record Details', name: 'record_details' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    { label: 'Cert No', fieldName: 'Name' },
    { label: 'Certification Name', fieldName: 'Cert_Name__c', type: 'text' },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text' },
    { type: 'action', typeAttributes: { rowActions: actions } }
];

export default class CertificationOperations extends LightningElement {

    cert_name = '';
    comments = '';

    handleChange(event) {
        if (event.target.label == 'Name') {
            this.cert_name = event.target.value;
        } else if (event.target.label == 'Comments') {
            this.comments = event.target.value;
        }
    }

    submit() {
        const fields = {};
        fields[CertName.fieldApiName] = this.cert_name;
        fields[CertComm.fieldApiName] = this.comments;

        const recordInp = { apiName: Cert_Object.objectApiName, fields };

        createRecord(recordInp).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Voila',
                message: 'Certification Added !',
                variant: 'success'
            }));
            location.reload();
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Oops',
                message: 'Certification Could Not Be Added !',
                variant: 'error'
            }));
        });
    }

    @track data = [];
    @track columns = columns;
    @track currentRecordId;
    @track isEditForm = false;
    @track bShowModal = false;
    @track record;

    error;
    refreshing;

    @wire(getCertList)
    Certification__c(result) {
        this.refreshing = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.data = undefined;
            this.error = result.error;
        }
        console.log(this.error);
    }

    handleActions(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;

        switch (actionName) {
            case 'record_details':
                this.viewCert(row);
                break;
            case 'edit':
                this.editCurrCert(row);
                break;
            case 'delete':
                this.deleteCert(row);
                break;
        }
    }

    viewCert(curRow) {
        this.bShowModal = true;
        this.isEditForm = false;
        this.record = curRow;
    }

    closeModal() {
        this.bShowModal = false;
    }

    editCurrCert(currRow) {
        this.bShowModal = true;
        this.isEditForm = true;
        this.currentRecordId = currRow.Id;
    }

    handleSubmit(event) {
        console.log("Update method called !");
        this.bShowModal = false;
        this.isEditForm = false;

        const fields = {};
        fields[CertId.fieldApiName] = this.currentRecordId;
        fields[CertName.fieldApiName] = event.detail.fields.Cert_Name__c;
        fields[CertComm.fieldApiName] = event.detail.fields.Comments__c;
        console.log(fields);

        const recordInp = { fields };

        updateRecord(recordInp).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Certification Updated !',
                variant: 'success'
            }));
            return refreshApex(this.refreshing);
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error updating the Certification',
                variant: 'error'
            }));
            console.log('Error aa gaya Bhaiyo');
        });
    }

    deleteCert(curRow) {
        deleteRecord(curRow.Id).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Deleted',
                message: 'Certification Record Deleted !',
                variant: 'success'
            }));
            return refreshApex(this.refreshing);
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Deleted Error',
                message: 'An Unexpected Error occured while deleting',
                variant: 'error'
            }));
        });
    }

}