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
                        {label:"Student Id", template:"StudentId"},
                        {label:"Student Name", template:"StudentName"},
                        {label:"Branch", template:"Branch"}
                    ]
                })

                var oTable = this.ovalueHelpDialog.getTable();
                oTable.setModel(oColModel,"columns")

                var oData = that.getView().getModel("oModel").getProperty("/result")

                var oRowModel = new JSONModel(oData)
                oTable.setModel(oRowModel)
                oTable.bindRows("/TableData")
                this.ovalueHelpDialog.open()

        
            }
        

        };



    });