sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../utils/searchHelp",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    'sap/ui/core/Fragment'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        Controller,
        JSONModel,
        ODataModel,
        MessageToast,
        Filter,
        FilterOperator,
        searchHelp,
        exportLibrary,
        Spreadsheet,
        FileUploader,
        Fragment
    ) {
        "use strict";
        let EdmType = exportLibrary.EdmType;

        return Controller.extend("project23.controller.View1", {
            searchHelp: searchHelp,
            onInit: function () {
                let oModelNew = new JSONModel();
                oModelNew.loadData("/json/test.json")
                this.getView().setModel(oModelNew, "oModelNew");
                // JSON Model
                const oModel = new JSONModel();
                this.getView().setModel(oModel, "oModel");

                this.newDialog = sap.ui.xmlfragment("project23.fragments.myDialog", this);
                this.newDialog2 = sap.ui.xmlfragment("project23.fragments.myDialog2", this);

                let oStatus = {
                    sId: true,
                    sName: true,
                    sBranch: true
                }
                this.getView().getModel("oModel").setProperty("/cFilter", oStatus);

            },
            //For setting visible for input 
            setVissible: function () {
                this.getView().byId("idInput").setVisible(true)
                this.getView().byId("go").setVisible(true)
            },
            ////For setting input and go buttons, hide
            setInVissible: function () {
                this.getView().byId("idInput").setVisible(false)
                this.getView().byId("go").setVisible(false)
            },
            //For closing the dialogs
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
                        that.getView().byId("_IDGenInput1").setVisible(true)
                        that.getView().byId("_IDGenOverflowToolbar1").setVisible(true)
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
                        that.getView().byId("_IDGenOverflowToolbar1").setVisible(true)
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
                    this.newDialog.getModel("oModel").setProperty("/update", oSelectedObject);
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
                let oTable = this.byId("dTable");
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
                oTable.removeSelections();
            },
            //To open the Dailog Box to get the data for creating the new record
            onCreate: function () {
                this.setInVissible()
                const oModel2 = new JSONModel();
                this.newDialog2.setModel(oModel2, "oModel");
                let a = { StudentId: '', StudentName: '', Branch: '' }
                this.newDialog2.getModel("oModel").setProperty("/create", a)
                this.newDialog2.open();
            },
            //For creating the new record
            getCreate: function () {
                const sUrl = "/sap/opu/odata/sap/ZBG_SEGW7_SRV/";
                const oDataModel = new ODataModel(sUrl, true);
                const that = this; // Store the reference to the outer context
                let oObject = this.newDialog2.getModel("oModel").getProperty("/create")
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
                if (aSelectedItems.length != 0) {
                    //Logic for Deleting the selected records 
                    for (let i = 0; i < aSelectedItems.length; i++) {
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
                else {
                    MessageToast.show("Select atleast one record to perform Delete operation");
                }
            },
            //For setting visible for input 
            setVissible2: function () {
                this.getView().byId("idInput2").setVisible(true)
                this.getView().byId("go2").setVisible(true)
            },
            getFilter: function () {
                debugger;
                let branchFilterValue = this.getView().byId("idInput2").getValue()
                if(branchFilterValue = ''){
                    this.getView().byId("dTable").getBinding("items").filter([]);
                }
                else{
                    branchFilterValue = branchFilterValue.toUpperCase()
                    let oFilter1 = new sap.ui.model.Filter({
                        path: 'Branch',
                        operator: "EQ",
                        value1: branchFilterValue
                    });
                    let arr = []
                    arr.push(oFilter1);
                    this.getView().byId("dTable").getBinding("items").filter(arr);
                }
            },
            donutChart1: function () {
                this.getView().byId("_IDGenInput1").setVisible(true)
                let branchObj = {
                    Branch1: 0,
                    Branch2: 0,
                    Branch3: 0,
                    Branch4: 0
                }
                let oUserTable = this.getView().byId("dTable").getItems();
                for (let i = 0; i < oUserTable.length; i++) {
                    let dataObject = oUserTable[i].getBindingContext("oModel").getObject();
                    if (dataObject.Branch == "CSE" || dataObject.Branch == "cse") {
                        branchObj.Branch1 += 1
                    }
                    else if (dataObject.Branch == "ECE" || dataObject.Branch == "ece") {
                        branchObj.Branch2 += 1
                    }
                    else {
                        branchObj.Branch4 += 1
                    }
                }
                this.getView().getModel("oModel").setProperty("/donutChart1", branchObj);
                this.getView().byId("_IDGenFlexBox2").setVisible(true)
            },
            onSelectionChanged: function (oEvent) {
                let label = oEvent.oSource.getSelectedSegments()
                let arr = []
                let arrayCheck = []
                if(label.length == 0){
                    this.getView().byId("dTable").getBinding("items").filter(arr);
                }

                else{
                    for (let i = 0; i < label.length; i++) {
                        arrayCheck.push(label[i].getLabel())
                        if (label[i].getLabel() == "OTHER") {
                            let oFilter1 = new sap.ui.model.Filter({
                                path: 'Branch',
                                operator: "NE",
                                value1: "CSE",
                            });
                            let oFilter2 = new sap.ui.model.Filter({
                                path: 'Branch',
                                operator: "NE",
                                value1: "ECE",
                            });
                            let oFilter3 = new sap.ui.model.Filter({
                                path: 'Branch',
                                operator: "NE",
                                value1: "MECH",
                            });
                            if(arrayCheck.indexOf("CSE") === -1 ){
                                arr.push(oFilter1)
                            }
                            if(arrayCheck.indexOf("ECE") === -1 ){
                                arr.push(oFilter2)
                            }
                            if(arrayCheck.indexOf("MECH") === -1 ){
                                arr.push(oFilter3)
                            }
                            this.getView().byId("dTable").getBinding("items").filter(
                                new sap.ui.model.Filter({
                                filters: arr,
                                and:true
                            }));
                        }
                    }
                    for (let i = 0; i < arrayCheck.length; i++){
                        
                        if(arrayCheck.indexOf("OTHER") === -1 )
                        {
                            let oFilter1 = new sap.ui.model.Filter({
                                path: 'Branch',
                                operator: "EQ",
                                value1: label[i].getLabel()
                            });
                            this.getView().byId("dTable").getBinding("items").filter(oFilter1)
                        }
                    }
                }

            },

            onSelectionChanged2:function(oEvent){

                let selectedSegment = oEvent.getParameter("segment").getLabel();    // Fetching currently selected lable from donut chart
                let label = oEvent.oSource.getSelectedSegments();                   // Fetching the selected segments from donut chart
                let oList = this.getView().byId("_IDGenList1").getSelectedItems()   // Fetching the selected items from the List
                let arrayCheck = [];                                                // For storing the all he selected branchs 
                let arr = [];                                                       // For storing the filters 
                // setting others as selected
                if (selectedSegment == "OTHER"){
                    let aList = this.getView().byId("DonutChart12").getSegments()
                    if (oList.length != 0){
                        aList[2].setSelected(true)
                    }
                    this.onOpenPopover(oEvent)
                }
                // Fetching the Selected Segments from Donut Chart
                for (let i = 0; i < label.length; i++) {
                    arrayCheck.push(label[i].getLabel())
                }
                // Fetching the Selected items from Pop Over list
                if(arrayCheck.indexOf("OTHER" != -1 )){
                    for (let i = 0; i < oList.length; i++) {
                        arrayCheck.push(oList[i].getTitle())
                    }
                }
                // creating the filters
                for (let i = 0; i < arrayCheck.length; i++){  
                    let oFilter1 = new sap.ui.model.Filter({ path: 'Branch', operator: "EQ", value1: arrayCheck[i] });
                    arr.push(oFilter1);
                }
                // Setting all the filters to the table
                this.getView().byId("dTable").getBinding("items").filter(arr);
            },
            closePop:function(){
                this.getView().byId("myPopover").setVisible(false)
            },
            onOpenPopover: function (oEvent) {
                debugger;
                let oPopover = this.getView().byId("myPopover")
                oPopover.setVisible(true)
                let oButton = oEvent.getSource();
                oPopover.openBy(oButton);
                let oArray = []
                let arr = []
                
                let oBinding = this.getView().getModel("oModel").getProperty("/result")
                for (let i =0 ; i<oBinding.length ; i++){
                    let oTemp = oBinding[i].Branch
                    oTemp = oTemp.toLowerCase()
                    if(oTemp != "cse" && oTemp != "ece"){
                        oTemp = oTemp.toUpperCase()
                        arr.push(oTemp)
                    }
                }

                let count= {}

                arr.forEach(element => {
                    count[element] = (count[element] || 0) + 1;
                });

                arr = [...new Set(arr)];
                for (let i =0 ; i<arr.length ; i++){
                    let oTempObject = {
                        Branch : arr[i],
                        Count : count[arr[i]]
                    }
                    oArray.push(oTempObject)
                }
                this.getView().getModel("oModel").setProperty("/input",oArray)
            },
            handleSelectionChange:function(){

                let oList = this.getView().byId("_IDGenList1").getSelectedItems()

                let label = this.getView().byId("DonutChart12").getSelectedSegments()
                let oArray = []

                // let arrayCheck = []
                for (let i = 0; i < label.length; i++) {
                    // arrayCheck.push(label[i].getLabel())
                    oArray.push(new sap.ui.model.Filter({path: 'Branch',operator: "EQ", value1: label[i].getLabel()}))
                }

                for(let i = 0; i<oList.length;i++){
                    let title  = oList[i].getTitle()
                    oArray.push(new sap.ui.model.Filter({path: 'Branch',operator: "EQ", value1: title}))
                }

                this.getView().byId("dTable").getBinding("items").filter(oArray)
            },
            cFilter: function () {
                this.byId("_IDGenDialog1").open()
            },
            handleSearch: function () {
                debugger;
                let filter = [];
                let query = this.getView().byId("_IDGenInput1").getValue()
                if (query && query.length > 0) {
                    filter.push(new Filter({
                        path: "StudentName",
                        operator: FilterOperator.Contains,
                        value1: query,
                    }));
                }
                // bind filter with list
                let getList = this.getView().byId("dTable");
                let bindingItems = getList.getBinding("items");
                bindingItems.filter(filter);
            },
            helpReq: function () {
                debugger;
                searchHelp.helpRequest(this)
            },
            onSelect: function(){
                this.getView().byId("_IDGenButton4").setVisible(true)
                this.getView().byId("_IDGenButton5").setVisible(true)
            },
            createColumnConfig: function () {
                let aCol = [];
                aCol.push({
                    label: 'Student Id',
                    type: EdmType.Number,
                    property: 'StudentId',
                })
                aCol.push({
                    label: 'Student Name',
                    type: EdmType.String,
                    property: 'StudentName',
                })
                aCol.push({
                    label: 'Branch',
                    type: EdmType.String,
                    property: 'Branch',
                })
                return aCol;
            },
            onExport: function () {
                let aCols, oRowBinding, oSettings, oSheet, oTable;
                if (!this._oTable) {
                    this._oTable = this.byId('dTable');
                }
                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();
                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Table export sample.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            handleUploadPress: function (oEvent) {
                debugger;
                let that = this;
                this.fixedDialog = new sap.m.Dialog({
                    title: "choose a file",
                    beginButton: new sap.m.Button({
                        text: "Upload",
                        press: function (e) {
                            that.fixedDialog.close();
                        }
                    }),
                    content: [new FileUploader("excelUploader")],
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            that.fixedDialog.close();
                        }
                    }),
                })
                this.getView().addDependent(this.fixedDialog)
                this.fixedDialog.open()
                this.fixedDialog.attachBeforeClose(this.setDataFromExcel, this);
            },
























        });
    });
