sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
(Controller, JSONModel) =>{
        "use strict";

        return  {

            helpRequest:function(that){

                debugger;
                
                var oInput = that.getView().byId("_IDGenInput1");
                if(!this.ovalueHelpDialog){
                    this.ovalueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idValueHelp",{
                        key:"Data",
                        supportMultiselect : false,
                        ok:function(oEvent){
                            debugger;
                            var token = oEvent.getParameter("tokens")[0].getText()
                            oInput.setValue(token)
                            this.close()         
                            that.handleSearch()

                        }, 
                        cancel:function(){
                            debugger;
                            this.close()

                        },
                    })                    
                }

                var oColModel = new JSONModel();
                oColModel.setData({
                    cols:[
                        {label:"Name", template:"Name"},
                        {label:"City", template:"City"},
                        {label:"Data", template:"Data"}
                    ]
                })

                var oTable = this.ovalueHelpDialog.getTable();
                oTable.setModel(oColModel,"columns")

                var oData = {
                    "TableData":[ 
                                {
                                    "Name":"a",
                                    "City":true,
                                    "Data":10
                                },
                                {
                                    "Name":"b",
                                    "City":true,
                                    "Data":"bhargav"
                                },
                                {
                                    "Name":"c",
                                    "City":false,
                                    "Data":true
                                },
                                {
                                    "Name":"d",
                                    "City":false,
                                    "Data":new Date(),
                                },
                                {
                                    "Name":"a",
                                    "City":true,
                                    "Data":10
                                },
                                {
                                    "Name":"b",
                                    "City":true,
                                    "Data":"bhargav"
                                },
                                {
                                    "Name":"c",
                                    "City":false,
                                    "Data":true
                                },
                                {
                                    "Name":"d",
                                    "City":false,
                                    "Data":new Date(),
                                }
                            ]}

                var oRowModel = new JSONModel(oData)
                oTable.setModel(oRowModel)
                oTable.bindRows("/TableData")
                this.ovalueHelpDialog.open()

        
            }
        

        };



    });