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
                        that.onSelectionChange();
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
                        that.donutChartCount.call(that);
                        that.onSelectionChange();
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
                if (branchFilterValue = '') {
                    this.getView().byId("dTable").getBinding("items").filter([]);
                }
                else {
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
            onSelectionChanged1: function (oEvent) {

                let selectedSegment = oEvent.getParameter("segment").getLabel();    // Fetching currently selected lable from donut chart
                let label = oEvent.oSource.getSelectedSegments();                   // Fetching the selected segments from donut chart
                let oList = this.getView().byId("_IDGenList1").getSelectedItems()   // Fetching the selected items from the List
                let arrayCheck = [];                                                // For storing the all he selected branchs 
                let arr = [];                                                       // For storing the filters 
                // setting others as selected
                if (selectedSegment == "OTHER") {
                    let aList = this.getView().byId("DonutChart1").getSegments()
                    if (oList.length != 0) {
                        aList[2].setSelected(true)
                    }
                    this.onOpenPopover(oEvent)
                }
                // Fetching the Selected Segments from Donut Chart
                for (let i = 0; i < label.length; i++) {
                    arrayCheck.push(label[i].getLabel())
                }
                // Fetching the Selected items from Pop Over list
                if (arrayCheck.indexOf("OTHER" != -1)) {
                    for (let i = 0; i < oList.length; i++) {
                        arrayCheck.push(oList[i].getTitle())
                    }
                }
                // creating the filters
                for (let i = 0; i < arrayCheck.length; i++) {
                    let oFilter1 = new sap.ui.model.Filter({ path: 'Branch', operator: "EQ", value1: arrayCheck[i] });
                    arr.push(oFilter1);
                }
                // Setting all the filters to the table
                this.getView().byId("dTable").getBinding("items").filter(arr);
            },
            closePop: function () {
                this.getView().byId("myPopover").setVisible(false)
            },
            onOpenPopover: function (oEvent) {
                debugger;
                this.getView().getModel("oModelNew").setProperty("/Others", []);
                let oPopover = this.getView().byId("myPopover")
                oPopover.setVisible(true)
                let oButton = oEvent.getSource();
                oPopover.openBy(oButton);
                var arr = []
                var res = this.getView().getModel("oModelNew").getProperty("/Others");
                var arr = this.getView().getModel("oModelNew").getProperty("/ans1");
                var cont = this.getView().getModel("oModelNew").getProperty("/val1");
                arr = [...new Set(arr)];
                for (var j = 0, k = 0; j < arr.length && k < cont.length; k++, j++) {
                    var obj = {
                        'Branch': arr[j].toUpperCase(),
                        'Count': cont[k]
                    }
                    res.push(obj)
                }
                this.getView().getModel("oModelNew").setProperty("/Others", res);
            },

            handleSelectionChange: function () {

                let oList = this.getView().byId("_IDGenList1").getSelectedItems()
                let label = this.getView().byId("DonutChart1").getSelectedSegments()
                let oArray = []

                for (let i = 0; i < label.length; i++) {
                    oArray.push(new sap.ui.model.Filter({ path: 'Branch', operator: "EQ", value1: label[i].getLabel() }))
                }

                for (let i = 0; i < oList.length; i++) {
                    let title = oList[i].getTitle()
                    oArray.push(new sap.ui.model.Filter({ path: 'Branch', operator: "EQ", value1: title }))
                }

                if (oList.length == 0) {
                    let aList = this.getView().byId("DonutChart1").getSegments()
                    aList[2].setSelected(false)
                }

                this.getView().byId("dTable").getBinding("items").filter(oArray)
            },
            cFilter: function () {
                this.byId("_IDGenDialog1").open()
            },
            handleSearch1: function () {
                debugger;
                let filter = [];
                let query = this.getView().byId("_IDGenInput1").getValue()
                if (query && query.length > 0) {
                    filter.push(new Filter({
                        path: "StudentId",
                        operator: FilterOperator.Contains,
                        value1: query,
                    }));
                }
                // bind filter with list
                // let getList = this.getView().byId("dTable");
                // let bindingItems = getList.getBinding("items");
                // bindingItems.filter(filter);
            },
            handleSearch2: function () {
                debugger;
                let filter = [];
                let query = this.getView().byId("_IDGenInput2").getValue()
                if (query && query.length > 0) {
                    filter.push(new Filter({
                        path: "StudentName",
                        operator: FilterOperator.Contains,
                        value1: query,
                    }));
                }
                // bind filter with list
                // let getList = this.getView().byId("dTable");
                // let bindingItems = getList.getBinding("items");
                // bindingItems.filter(filter);
            },
            handleSearch3: function () {
                debugger;
                let filter = [];
                let query = this.getView().byId("_IDGenInput3").getValue()
                if (query && query.length > 0) {
                    filter.push(new Filter({
                        path: "Branch",
                        operator: FilterOperator.Contains,
                        value1: query,
                    }));
                }
                // bind filter with list
                // let getList = this.getView().byId("dTable");
                // let bindingItems = getList.getBinding("items");
                // bindingItems.filter(filter);
            },
            helpReq1: function () {
                debugger;
                searchHelp.helpRequest1(this)
            },
            helpReq2: function () {
                debugger;
                searchHelp.helpRequest2(this)
            },
            helpReq3: function () {
                debugger;
                searchHelp.helpRequest3(this)
            },
            onSelect: function () {
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

            donutChartCount: function () {
                debugger;
                var arr = this.getView().getModel('oModel').getProperty("/result");
                const counter = {};
                var brr = [];
                arr.forEach(i => {
                    brr.push(i.Branch)
                });
                brr.forEach(ele => {
                    if (counter[ele]) {
                        counter[ele] += 1;
                    } else {
                        counter[ele] = 1;
                    }
                });
                const keyValueArray = Object.entries(counter);
                keyValueArray.sort((a, b) => b[1] - a[1]);
                const sortedObject = Object.fromEntries(keyValueArray);
                console.log(sortedObject);
                var objNames = [];
                var objValues = [];
                for (var i in sortedObject) {
                    objNames.push(i);
                    objValues.push(sortedObject[i])
                }
                var name = this.getView().getModel('oModelNew').getProperty("/obj1");
                var valu = this.getView().getModel("oModelNew").getProperty("/obj2");
                this.getView().getModel('oModelNew').setProperty("/obj1/branchA", objNames[0]);
                this.getView().getModel('oModelNew').setProperty("/obj1/branchB", objNames[1]);
                this.getView().getModel("oModelNew").setProperty("/obj2/countA", objValues[0]);
                this.getView().getModel("oModelNew").setProperty("/obj2/countB", objValues[1]);
                var objNameslen = objNames.slice(2,);
                var objValuelen = objValues.slice(2,);
                this.getView().getModel('oModelNew').setProperty("/ans1", objNameslen);
                this.getView().getModel('oModelNew').setProperty("/val1", objValuelen);
                objValuelen = objValuelen.length;
                this.getView().getModel("oModelNew").setProperty("/count/res", objValuelen);
            },

            onSelectionChange: function (oEvent) {
                debugger;

                let sKey = this.getView().byId("SB1").getSelectedKey();
                if (sKey == "Filter") {
                    this.getView().byId("_IDGenFlexBox2").setVisible(false)
                    this.getView().byId("_IDGenFlexBox4").setVisible(true)
                }
                else {
                    this.getView().byId("_IDGenFlexBox2").setVisible(true)
                    this.getView().byId("_IDGenFlexBox4").setVisible(false)
                }

            },
            onSearch: function () {
                let nId = this.getView().byId("_IDGenInput1").getValue();
                let sName = this.getView().byId("_IDGenInput2").getValue();
                let sBranch = this.getView().byId("_IDGenInput3").getValue();

                let aArray2 = []

                if (nId != '') {

                    let oFilter1 = new sap.ui.model.Filter({
                        path: 'StudentId',
                        operator: "EQ",
                        value1: nId
                    });
                    aArray2.push(oFilter1)
                }
                if (sName != '') {

                    let oFilter1 = new sap.ui.model.Filter({
                        path: 'StudentName',
                        operator: FilterOperator.Contains,
                        value1: sName
                    });
                    aArray2.push(oFilter1)
                }
                if (sBranch != '') {

                    let oFilter1 = new sap.ui.model.Filter({
                        path: 'Branch',
                        operator: FilterOperator.Contains,
                        value1: sBranch
                    });
                    aArray2.push(oFilter1)
                }

                this.getView().byId("dTable").getBinding("items").filter(aArray2);



            }





















        });
    });
