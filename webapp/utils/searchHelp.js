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

            helpRequest1:function(that){

                debugger;
                
                let oInput = that.getView().byId("_IDGenInput1");
                if(!this.ovalueHelpDialog1){
                    this.ovalueHelpDialog1 = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idValueHelp1",{
                        key:"StudentId",
                        supportMultiselect : false,
                        ok:function(oEvent){
                            debugger;
                            let token = oEvent.getParameter("tokens")[0].getText()
                            oInput.setValue(token)
                            this.close()         
                            that.handleSearch1()
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
                let oTable = this.ovalueHelpDialog1.getTable();
                oTable.setModel(oColModel,"columns")
                let aArrayObject = that.getView().getModel("oModel").getProperty("/result")
                let oData = {result:aArrayObject}
                let oRowModel = new JSONModel(oData)
                oTable.setModel(oRowModel)
                oTable.bindRows("/result")
                this.ovalueHelpDialog1.open()
            },


            helpRequest2:function(that){

                debugger;
                
                let oInput = that.getView().byId("_IDGenInput2");
                if(!this.ovalueHelpDialog2){
                    this.ovalueHelpDialog2 = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idValueHelp2",{
                        key:"StudentName",
                        supportMultiselect : false,
                        ok:function(oEvent){
                            debugger;
                            let token = oEvent.getParameter("tokens")[0].getText()
                            oInput.setValue(token)
                            this.close()         
                            that.handleSearch2()
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
                let oTable = this.ovalueHelpDialog2.getTable();
                oTable.setModel(oColModel,"columns")
                let aArrayObject = that.getView().getModel("oModel").getProperty("/result")
                let oData = {result:aArrayObject}
                let oRowModel = new JSONModel(oData)
                oTable.setModel(oRowModel)
                oTable.bindRows("/result")
                this.ovalueHelpDialog2.open()
            },

            helpRequest3:function(that){

                debugger;
                
                let oInput = that.getView().byId("_IDGenInput3");
                if(!this.ovalueHelpDialog3){
                    this.ovalueHelpDialog3 = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idValueHelp3",{
                        key:"Branch",
                        supportMultiselect : false,
                        ok:function(oEvent){
                            debugger;
                            let token = oEvent.getParameter("tokens")[0].getText()
                            oInput.setValue(token)
                            this.close()         
                            that.handleSearch3()
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
                let oTable = this.ovalueHelpDialog3.getTable();
                oTable.setModel(oColModel,"columns")
                let aArrayObject = that.getView().getModel("oModel").getProperty("/result")
                let oData = {result:aArrayObject}
                let oRowModel = new JSONModel(oData)
                oTable.setModel(oRowModel)
                oTable.bindRows("/result")
                this.ovalueHelpDialog3.open()
            }
        

        };




    });