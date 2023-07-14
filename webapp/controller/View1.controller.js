sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    'sap/m/MessageToast'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, ODataModel, MessageToast) {
        "use strict";

        return Controller.extend("project23.controller.View1", {
            onInit: function () {

                //// JSON Model
                const oModel = new JSONModel();
                this.getView().setModel(oModel, "oModel");

                this.newDialog = sap.ui.xmlfragment("project23.fragments.myDialog", this);
                this.newDialog2 = sap.ui.xmlfragment("project23.fragments.myDialog2", this);

                let oStatus = {
                    sId : true,
                    sName : true,
                    sBranch :true
                } 
                this.getView().getModel("oModel").setProperty( "/cFilter", oStatus);  

            },
            //For setting visible for input 
            setVissible: function () {
                this.getView().byId("idInput").setVisible(true)
                this.getView().byId("go").setVisible(true)
            },
            ////For setting input and go button hide.
            setInVissible: function () {
                this.getView().byId("idInput").setVisible(false)
                this.getView().byId("go").setVisible(false)
            },
            // For closing the dialogs
            onCancel: function () {
                this.newDialog.close();
                this.newDialog2.close();
                this.byId("_IDGenDialog1").close()
            },
            //For getting the single record based on the input key value
            getEntity: function () {
                // oData Model
                const sUrl = "/sap/opu/odata/sap/ZBG_SEGW7_SRV/";
                const oDataModel = new ODataModel(sUrl, true);
                const that = this; // Store the reference to the outer context
                let idInput = this.getView().byId("idInput").getValue();
                oDataModel.read("/zbgsegw7Set(" + idInput + ")", {
                    success: function (oData) {
                        let aData = []
                        aData.push(oData)
                        MessageToast.show("oData call is successful");
                        that.getView().getModel("oModel").setProperty("/result", aData);
                        that.byId("dTable").setVisible(true);
                        that.donutChart1();

                    }
                });
            },
            //For getting the total number of records in the DB Table
            getEntitySet: function () {
                this.setInVissible()
                // oData Model
                const sUrl = "/sap/opu/odata/sap/ZBG_SEGW7_SRV/";
                const oDataModel = new ODataModel(sUrl, true);
                const that = this; // Store the reference to the outer context
                oDataModel.read("/zbgsegw7Set", {
                    success: function (oData) {
                        MessageToast.show("oData call is successful");
                        that.getView().getModel("oModel").setProperty("/result", oData.results);
                        that.byId("dTable").setVisible(true);
                        that.donutChart1();
                    }
                });

            },
            //For fetching only one record to perform edit operation
            onEdit: function (oEvent) {
                let oTable = this.byId("dTable");
                const oModel = oTable.getModel("oModel");
                this.setInVissible()                     
                let aSelectedItems = oTable.getSelectedItems();
                if (aSelectedItems.length == 1) {
                    const oModel1 = new JSONModel();
                    this.newDialog.setModel(oModel1, "oModel");
                    // Single item selected, edit the details
                    let oSelectedItem = aSelectedItems[0];
                    let sPath = oSelectedItem.getBindingContextPath();
                    let oSelectedObject = oModel.getProperty(sPath);
                    // Open the dialog and set the values in the inputs
                    this.newDialog.getModel("oModel").setProperty( "/update", oSelectedObject );              
                    this.newDialog.open();
                }
                else if (aSelectedItems.length > 1) {
                    // Multiple items selected, cannot edit
                    sap.m.MessageToast.show("Please select only one item to edit");
                }
                else {
                    // No item selected, show message
                    sap.m.MessageToast.show("Please select an item to edit");
                }
            },
            //To update the Record which we got select
            getUpdate: function () {
                this.setInVissible()
                // oData Model
                const sUrl = "/sap/opu/odata/sap/ZBG_SEGW7_SRV/";
                const oDataModel = new ODataModel(sUrl, true);
                const that = this; // Store the reference to the outer context
                let oSelectedObject = this.newDialog.getModel("oModel").getProperty("/update")
                this.newDialog.close();//Closing the Dialog Box
                //oData calling for update
                oDataModel.update("/zbgsegw7Set(" + oSelectedObject.StudentId + ")", oSelectedObject, {
                    success: function () {
                        MessageToast.show("Record updated successfully");
                        that.byId("dTable").setVisible(true);
                        that.getEntitySet()
                        that.donutChart1();
                    },
                    error: function () {
                        MessageToast.show("Error occurred while updating the record");
                    }
                });
            },
            //To open the Dailog Box to get the data for creating the new record
            onCreate: function () {
                this.setInVissible()
                const oModel2 = new JSONModel();
                this.newDialog2.setModel(oModel2, "oModel");
                let a = {StudentId:'',StudentName:'',Branch:''}
                this.newDialog2.getModel("oModel").setProperty( "/create",a)
                this.newDialog2.open();
            },
            //For creating the new record
            getCreate: function () {
                const sUrl = "/sap/opu/odata/sap/ZBG_SEGW7_SRV/";
                const oDataModel = new ODataModel(sUrl, true);  
                const that = this; // Store the reference to the outer context
                let oObject = this.newDialog2.getModel("oModel").getProperty( "/create")
                oObject.StudentId = parseInt(oObject.StudentId)
                this.newDialog2.close();    //To close the Dialog box 
                //oData call to create the new record
                oDataModel.create("/zbgsegw7Set", oObject, {
                    success: function () {
                        MessageToast.show("Record Create successfully");
                        that.getEntitySet();
                        that.donutChart1();
                    },
                    error: function () {
                        MessageToast.show("Error occurred while Creating the record");
                    }
                });
            },
            //To validate and delete the single selected record
            onDelete: function () {
                this.setInVissible()
                let oTable = this.byId("dTable");
                let aSelectedItems = oTable.getSelectedItems();
                if(aSelectedItems.length != 0){
                    //Logic for Deleting the selected records 
                    for (let i = 0; i<aSelectedItems.length;i++ ){
                        let oSelectedObject = aSelectedItems[i].getBindingContext("oModel").getObject()
                        const that = this; // Store the reference to the outer context
                        const sUrl = "/sap/opu/odata/sap/ZBG_SEGW7_SRV/";
                        const oDataModel = new ODataModel(sUrl, true);
                        //oData call for deleting the record
                        oDataModel.remove("/zbgsegw7Set(" + oSelectedObject.StudentId + ")", {
                            success: function () {
                                MessageToast.show("Record Deleted successfully");
                                oTable.removeSelections();
                                that.getEntitySet();

                            },
                            error: function () {
                                MessageToast.show("Error occurred while Deleting the record");
                            }
                        });
                    }
                }
                else{
                    MessageToast.show("Select atleast one record to perform Delete operation");

                }


            },
            //For setting visible for input 
            setVissible2: function () {
                this.getView().byId("idInput2").setVisible(true)
                this.getView().byId("go2").setVisible(true)
            },
            getFilter:function(){
                debugger;
                let branchFilterValue = this.getView().byId("idInput2").getValue()
                let oFilter1 = new sap.ui.model.Filter({
                    path : 'Branch',
                    operator: "EQ",
                    value1 : branchFilterValue
                });
                let arr = []
                arr.push(oFilter1);
                this.getView().byId("dTable").getBinding("items").filter(arr);

            },
            donutChart1:function(){
                let branchObj = {
                    Branch1:0,
                    Branch2:0,
                    Branch3:0,
                    Branch4:0
                }
                let oUserTable = this.getView().byId("dTable").getItems();
                for (let i=0;i< oUserTable.length; i++){
                    let dataObject = oUserTable[i].getBindingContext("oModel").getObject();

                    if (dataObject.Branch == "CSE" || dataObject.Branch == "cse"){
                        branchObj.Branch1+=1
                    }
                    else if (dataObject.Branch == "ECE" || dataObject.Branch == "ece"  ){
                        branchObj.Branch2+=1
                    } 
                    else if(dataObject.Branch == "MECH" || dataObject.Branch == "mech"){
                        branchObj.Branch3+=1
                    }
                    else{
                        branchObj.Branch4+=1
                    }

                }
                this.getView().getModel("oModel").setProperty( "/donutChart1", branchObj);              
                this.getView().byId("_IDGenFlexBox2").setVisible(true)
            },
            onSelectionChanged:function(oEvent){
                let label = oEvent.oSource.getSelectedSegments()
                let arr = []
                for (let i=0; i<label.length; i++){
                    if (label[i].getLabel() == "OTHER"){
                        // let oFilter1 = new sap.ui.model.Filter({
                        //     path : 'Branch',
                        //     operator: "NE",
                        //     value1 :"CSE",
                        // });
                        let oFilter2 = new sap.ui.model.Filter({
                            path : 'Branch',
                            operator: "NE",
                            value1 :"CSE",
                            operator:"&&",
                            path : 'Branch',
                            operator: "NE",
                            value2 :"ECE",
                        });

                    // arr.push(oFilter1)
                    arr.push(oFilter2)

                    }
                    else{
                        let oFilter1 = new sap.ui.model.Filter({
                            path : 'Branch',
                            operator: "EQ",
                            value1 :label[i].getLabel()
                        });
                    arr.push(oFilter1)
                    }
                }
                this.getView().byId("dTable").getBinding("items").filter(arr);

            },
            cFilter:function(){


                this.byId("_IDGenDialog1").open()

                
            },
            test:function(){

                let oTable = this.byId("dTable");
                const oModel = oTable.getModel("oModel");
                let oItems = oTable.getItems();
                let aSelectedItems = [];
                for (let i = 0; i < oItems.length; i++) {
                    if (oItems[i].getCells()[0].getSelected()) {
                        aSelectedItems.push(oItems[i]);
                        // that.donutChart1();
                    }
                }
                var oUserDetArray = aSelectedItems; 

                oModel.setDeferredGroups(["batchFunctionImport"]);
                for (i = 0; i < oUserDetArray.length; i++) {
                    oModel.callFunction("/User_FunctionImp", {
                        method: "POST",
                        batchGroupId: "batchFunctionImport",
                        changeSetId: i,
                    });
                }
            }






















        });
    });
