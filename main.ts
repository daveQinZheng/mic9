
/**
 * 37907909@qq.com
 * 使用此文件来定义自定义函数和图形块。
 * 想了解更详细的信息，请前往 https://makecode.microbit.org/blocks/custom
 */
/**
 * lightEnum
 */
enum lightEnum {
    //% block="double-light"
    Double =0,
    //% block="left-light"
    Left= -4,
    //% block="right-light"
    Right = -5
}



/**
 * 自定义图形块
 */
//% weight=0 color=#3CB371 icon="\uf0ad" block="roboloq"
namespace robobloq {
    /**
     * 通信协议
     */
    export class Protocol
    {
        getTestLeb(item:number[]):number {
            if(item.length >=4){
                return item[4];
            }
            return 0;
        }

        /**
         * 获取超声波数值
         *
         * @param {any} order 命令序号
         * @param {any} port 端口
         */
        getUltrasonicValue(order:number, port:number):number[] {
            let size:number = 7 ;
            let list:number[]=[82,66,size,order, 0xA1,port,0];
            list[size-1] = this.sumCheck(list,0);
            return list;
        }
        /**
         * 获取超声波数值（单位 cm）
         */
        parseUltrasonicValue(itme:number[]):number {
            if (!itme || itme.length < 6) return 0;
            const value :number= itme[5]  * 256 + itme[6];
            return (value / 10);
        }
        /**
         * 设置超声波灯光
         */
        setUltrasonicLight(order:number, port:number, red:number, green:number, blue:number) :number[] {
            let size:number = 10 ;
            let list:number[]=[82,66,size,order, 0x12,port,red,green,blue,0];
            list[size-1] = this.sumCheck(list,0);
            return list; 
        }

        /**
        * 设置点阵屏
        */
        setMatrix(order:number, port:number, rows:number[]):number[] {
            let size:number = 27 ;
            let list:number[]=[82,66,size,order, 0x14,port,rows[0],0];
            let j :number = 6 ;
            for(let i:number=0;i<10;i++){
                let l1:number[] = this.Int16BE(rows[i]);
                list[j]= l1[0];
                list[j+1]= l1[1];
                j = j+2 ;
            }
            list[size-1] = this.sumCheck(list,0);
            return list;
        }

        setBuzzer(order:number, rate:number, time:number):number[] {
            let size:number = 11 ;
            let l1:number[] = this.Int16BE(rate);
            let l2:number[] = this.Int16BE(time);
            let list:number[]=[82,66,size,order, 0x13,0xfa,l1[0],l1[1],l2[0],l2[1],0];
            list[size-1] = this.sumCheck(list,0);
            return list;
        }

        setMove(order:number, m1Speed:number, m2Speed:number):number[] {
            let size:number = 9 ;
            let list:number[]=[82,66,size,order, 0x11,0,m1Speed,m2Speed,0];
            list[size-1] = this.sumCheck(list,0);
            return list;
        }

        setMotor(order:number, port:number, speed:number):number[]{
            let size:number = 8 ;
            let list:number[]=[82,66,size,order, 0x11,port,speed,0];
            list[size-1] = this.sumCheck(list,0);
            return list;
        }

        setLed(order:number,port:number,red:number,green:number,blue:number):number[]{
            let size:number =10 ;
            let list:number[]=[82,66,size,order,16,port,red,green,blue,0];
            list[size-1] = this.sumCheck(list,0);
            return list;
        }

        sumCheck(list:number[],type:number):number {
            let sum = 0;
            let length = list.length;
            if(type ===1){
                length = list.length -1;
            }
            for (let i = 0; i < length; i++) {
                sum += list[i];
            }
            return sum % 256;
        }

        //储存12: Int16BE用<00 0c> , Int16LE用<0c 00>
        Int16BE(v:number):number[]{
            let ls:number[] =[0,0];
            ls[0] = (v / 256);
            ls[1] = (v % 256);
            return ls;
        }

        listToString(list:number[]):string{
            let st =":";
            let size :number = list.length ;
            if(size <1)return st;
            for(let i=0;i< size;i++){
                st = st+"."+list[i];
            }
            return st;
        }
    }

    let flagInit :number = 0;
    const pro = new Protocol();
    //const rb = new Robot();

    //% blockId="lightRgb" block="set %e| in LED panel red %red|green %green | blue %blue"
    export function lightRgb(e:lightEnum,red:number,green:number,blue:number): void {
        let oid = 0;// rb.orderId(); //0;
        //let list = pro.setLed(oid,e,red,green,blue);
        //rb.write(list);
    }


    /**
     * robot
     */
    export class Robot {
        OrderIndex:number ;
        dataList:Array<number[]> ;

        init():void{
            this.OrderIndex = 1;
            this.dataList = [];
        }
        /**
         * 生成订单ID
         */
        orderId():number {
            if(!this.OrderIndex) this.OrderIndex = 1;
            this.OrderIndex++;
            const maxId:number = 255;
            if (this.OrderIndex >= maxId) {
                this.OrderIndex = 2;
            }
            return this.OrderIndex;
        }

        /**
         * 取主板返回的数据
         * @param oid =0为主动上报，其它为正常请求数据；
         * @param act 主动上报的类型
         */
        getDataItem(oid:number,act:number):number[]{
            let item:number[] =[];
            let size:number = this.dataList.length;
            if(size<=0)return item;
            for(let i=0;i<size;i++){
                 let it:number[] = this.dataList[i];
                 if(it.length <=3) continue;
                 //正常数据
                 if(oid >0 && it[3]== oid){
                     item = it;
                     //担心 这里会删除错误
                    this.dataList.splice(i, 1);
                    //return item;
                 }
                 //主动上报数据
                 if(oid == 0 && it[4]== act){
                    item = it;
                    this.dataList.splice(i, 1);
                 }
            }
            if(size >= 250){
                this.dataList =[];
            }
            return item;
        }

        dataPush(db:string):void{
            let d:number[] = this.dataFormat(db);
            if(d !=[] && d.length >2 ){
                let size :number = d.length ;
                if(size <3)return;
                this.dataList.push(d);
                //basic.showString("M"+ this.dataList.length );
                //basic.showString("W"+ pro.listToString(d) );
            }
        }
    
        dataFormat(db:string):number[]{
            let list :number[] = [];
            if(db && db.length >2){
                let size :number = db.length ;
                if(size <1)return list;
                //let st =":";
                for(let i=0;i< size;i++){
                    list.push(db.charCodeAt(i));
                    //st = st+"."+db.charCodeAt(i);
                }
            }
            return list;
        }

        write(list:number[]):void{
            this.SystemInit();
            let size = list.length ;
            let buffer = pins.createBuffer(size);
            for(let i:number=0;i<size;i++){
                buffer.setNumber(NumberFormat.Int8LE, i, list[i]);
            }
            serial.writeBuffer(buffer);
            basic.pause(20);
            //this.read();
        }
    
        read():void{
            let db = serial.readString();
            if(db && db.length >4){
                this.dataPush(db);
            }
        }

        SystemInit(): void {
            if(flagInit ==1) return;
            serial.redirect(
                SerialPin.P1,
                SerialPin.P0,
                BaudRate.BaudRate115200
            )
            this.init();
            // 要加这个[serial.readString]，如果不加会卡死；
            let data2 = serial.readString();
            this.dataPush(data2);
            flagInit =1;
        }
    }



}

