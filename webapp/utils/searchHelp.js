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
                
                let oInput = that.getView().byId("_IDGenInput1");
                if(!this.ovalueHelpDialog){
                    this.ovalueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idValueHelp",{
                        key:"StudentName",
                        supportMultiselect : false,
                        ok:function(oEvent){
                            debugger;
                            let token = oEvent.getParameter("tokens")[0].getText()
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
                let oColModel = new JSONModel();
                oColModel.setData({
                    cols:[
                        {label:"Student Id", template:"StudentId"},
                        {label:"Student Name", template:"StudentName"},
                        {label:"Branch", template:"Branch"}
                    ]
                })
                let oTable = this.ovalueHelpDialog.getTable();
                oTable.setModel(oColModel,"columns")
                let aArrayObject = that.getView().getModel("oModel").getProperty("/result")
                let oData = {result:aArrayObject}
                let oRowModel = new JSONModel(oData)
                oTable.setModel(oRowModel)
                oTable.bindRows("/result")
                this.ovalueHelpDialog.open()
            }
        

        };



    });