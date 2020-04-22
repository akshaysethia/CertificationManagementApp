import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import getRequestList from '@salesforce/apex/Fetchdata.reqData';

import ReqId from '@salesforce/schema/Certification_Request__c.Id';
import ReqCertName from '@salesforce/schema/Certification_Request__c.Certification__c';
import ReqEmpName from '@salesforce/schema/Certification_Request__c.Employee__c';
import ReqDueDate from '@salesforce/schema/Certification_Request__c.Due_Date__c';
import ReqStatus from '@salesforce/schema/Certification_Request__c.Status__c';
import ReqVouchName from '@salesforce/schema/Certification_Request__c.Voucher__c';
import ReqComm from '@salesforce/schema/Certification_Request__c.Comments__c';

const actions = [
    { label: 'Record Details', name: 'record_details' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];

const columns = [
    { label: 'Request Id', fieldName: 'Name' },
    { label: 'Certification Name', fieldName: 'Certification__c' },
    { label: 'Employee Name', fieldName: 'Employee__c' },
    { label: 'Due Date', fieldName: 'Due_Date__c' },
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Voucher Name', fieldName: 'Voucher__c' },
    { label: 'Request Comments', fieldName: 'Comments__c' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
        }
    }
];

export default class CertireqOperations extends LightningElement {

    fields = [ReqCertName, ReqEmpName, ReqDueDate, ReqStatus, ReqComm, ReqVouchName];

    handleSuccess(event) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Voila',
            message: 'Request Created !',
            variant: 'success'
        }));
        location.reload();
    }

    @track requests;
    @track columns = columns;
    @track record;
    @track currentRecordId;
    @track isEditForm = false;
    @track bShowModal = false;

    error;
    refreshTable;

    @wire(getRequestList)
    Certification_Request__c(result) {
        this.refreshTable = result;
        if (result.data) {
            this.requests = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.requests = undefined;
            this.error = result.error;
        }
        console.log('Error: ' + this.error);
    }

    handleRowActions(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;

        switch (actionName) {
            case 'record_details':
                this.viewReq(row);
                break;
            case 'edit':
                this.editCurrReq(row);
                break;
            case 'delete':
                this.deleteReq(row);
                break;
        }
    }

    viewReq(currRow) {
        this.bShowModal = true;
        this.isEditForm = false;
        this.record = currRow;
    }

    closeModal() {
        this.bShowModal = false;
    }

    editCurrReq(currRow) {
        this.bShowModal = true;
        this.isEditForm = true;
        this.currentRecordId = currRow.Id;
    }

    handleSubmit(event) {
        console.log("Update method called !");
        this.bShowModal = false;
        this.isEditForm = false;

        const fields = {};
        fields[ReqId.fieldApiName] = this.currentRecordId;
        fields[ReqCertName.fieldApiName] = event.detail.fields.Certification__c;
        fields[ReqEmpName.fieldApiName] = event.detail.fields.Employee__c;
        fields[ReqDueDate.fieldApiName] = event.detail.fields.Due_Date__c;
        fields[ReqStatus.fieldApiName] = event.detail.fields.Status__c;
        fields[ReqVouchName.fieldApiName] = event.detail.fields.Voucher__c;
        fields[ReqComm.fieldApiName] = event.detail.fields.Comments__c;
        console.log(fields);

        const recordInp = { fields };

        updateRecord(recordInp).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Request Updated !',
                variant: 'success'
            }));
            return refreshApex(this.refreshTable);
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error updating Request !',
                variant: 'error'
            }));
            console.log('Error aa gaya Bhaiyo');
        });
    }

    deleteReq(currRow) {
        deleteRecord(currRow.Id).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Deleted',
                message: 'Request Deleted Successfully !',
                variant: 'success'
            }));
            return refreshApex(this.refreshTable);
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Request could not be Deleted !',
                variant: 'error'
            }));
        });
    }

}