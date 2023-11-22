<template>
   <el-row>
    <div v-if="role === 'admin'">
      <el-row style="margin-left: 5px; margin-right: 5px; margin-bottom: 0px" :gutter="10">
        <el-col class="card-1" :span="16">
          <el-card class="box-card" shadow="always">
            <!-- 显示数据的卡片 -->
            <div slot="header" class="clearfix">
              <span>实时交易情况</span>
            </div>
            <div>
              <el-row :gutter="10" type="flex" justify="space-around">
                <el-col :span="5">
                  <el-card class="card-item" shadow="hover">
                    <div>
                      <span class="card-text">今日交易订单数</span>
                      <span class="card-data">{{ this.orderData.dataCount.orderCount }}</span>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="5">
                  <el-card class="card-item" shadow="hover">
                    <div>
                      <span class="card-text">待检测土壤标本数</span>
                      <span class="card-data">{{ this.orderData.dataCount.utSoilCount }}</span>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="5">
                  <el-card class="card-item" shadow="hover">
                    <div>
                      <span class="card-text">用户数量</span>
                      <span class="card-data">{{ this.orderData.dataCount.userCount }}</span>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
        <el-col style="margin-top: 10px" :span="8">
          <el-card class="box-card" shadow="always" style="height: 257px">
            <!-- 显示数据的卡片 -->
            <div slot="header" class="clearfix">
              <span>订单提醒日志</span>
            </div>
            <div>
              <div>
                <!-- 文本框 -->
                <el-input
                  type="textarea"
                  :rows="6"
                  v-model="message"
                  style="resize: none; margin-bottom: 10px"
                ></el-input>
                <div style="display: flex">
                  <el-button @click="connectWebSocket" type="success" plain>开启订单提醒</el-button>
                  <el-button @click="showCloseConfirm" type="danger" plain>关闭订单提醒</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-col class="card-2" :span="24">
        <el-card class="box-card filter" :body-style="{ padding: '0px' }">
          <div style="display: flex; align-items: center">
            <div><span style="margin-left: 10px">订单量</span></div>
            <div class="right-box">
              <el-button @click="changeChartData('week')" type="primary" plain
                ><span>本周</span></el-button
              >
              <el-button @click="changeChartData('month')" type="primary" plain
                ><span>本月</span></el-button
              >
              <el-button @click="changeChartData('year')" type="primary" plain
                ><span>全年</span></el-button
              >
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col class="card-3" :span="24">
        <el-card class="box-card">
          <div class="chart" ref="myChart"></div>
        </el-card>
      </el-col>
    </div>
    <div v-if="role === 'common'">
    <el-row style="margin-top: 10px; margin-left: 10px; margin-right: 10px">
      <el-col :span="24">
        <el-card class="box-card">
          <div>
            <h1 style="text-align: center;">欢迎使用测土后台管理系统</h1>
            <h3 style="text-align: center;">请在专家配方管理模块中根据检测单信息为该土壤书写配方建议</h3>
            <div style="text-align: center;">
              <img :src="require('@/assets/images/土壤.jpeg')" alt="Soil Image">
            </div>
            <h5 style="text-align: center;">声明：测土后台管理系统是一款专业服务于土壤检测机构和专家的系统。我们致力于提供高效的土壤检测服务和专业的土壤配方管理，以支持农业和环境领域的可持续发展。</h5>
            <h6 style="text-align: center;">配方最终解释权归机构所有</h6>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  </el-row>

</template>

<script>
import { getData } from "@/api/home";
import * as echarts from "echarts";
import { getUserProfile } from "@/api/system/user.js";

export default {
  data() {
    return {
      chartData: [],
      orderData: {
        dataCount: {},
        week: [],
        month: [],
        year: [],
      },
      version: "3.8.6",
      user: {},
      socket: null,
      userId: "",
      message: "",
      text: "",
      role: "",
    };
  },
  created() {

    this.getUser().then(() => {
      if (this.role === "admin") {
        this.init();
        this.connectWebSocket();

      }
    });

  },
  mounted() {
    this.updateChart(this.chartData);
    // 在组件加载时执行WebSocket连接

  },
  methods: {
    //初始化首页数据
    async init() {
      const UnTest = 2; //未检测状态

      try {
        const response = await getData({ type: UnTest });
        this.orderData = response.data;
        console.log(this.orderData, "message");

        // 初始表格数据为周数据
        this.chartData = this.dateChangeWeek(this.orderData.week);
        // 在数据加载完成后再更新图表
        this.updateChart(this.chartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    updateChart(newChartData) {
      //基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(this.$refs.myChart);

      //指定图标的配置项和数据
      var option = {
        color: ["#6236FF"],
        //设置图表标题
        title: {
          text: "订单量趋势",
        },
        tooltip: {},
        grid: {
          left: "4%",
          right: "2%",
        },
        legend: {
          data: ["销量"],
        },

        xAxis: {
          type: "category",
          data: newChartData.map((item) => item.orderDate), //待修改
          axisLabel: {
            color: "#9B9EAC",
            fontSize: 15,
            fontWeight: "bold",
            interval: "auto",
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#9B9EAC",
            fontSize: 15,
          },
        },
        series: [
          {
            name: "销量",
            type: "line",
            data: newChartData.map((item) => item.orderCount),
            barWidth: "15%",
            smooth: true,
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },

    //获取当前日期方法
    localDate() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const day = currentDate.getDate().toString().padStart(2, "0");

      const localDate = `${year}-${month}-${day}`;
      return localDate;
    },

    //根据传入的日期修改为对应的星期
    dateChangeWeek(orderData) {
      const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
      const orderDataCopy = JSON.parse(JSON.stringify(orderData));
      const chartWeekWithWeekday = orderDataCopy.map((item) => {
        const date = new Date(item.orderDate);
        const weekdayIndex = date.getDay();

        // 将星期日（索引为 0）移到数组的最后一位
        if (weekdayIndex === 0) {
          item.orderDate = weekdays[6];
        } else {
          item.orderDate = weekdays[weekdayIndex - 1];
        }

        return item;
      });
      return chartWeekWithWeekday;
    },

    dateChangeMonth(orderData) {
      console.log(orderData);
      const orderDataCopy = JSON.parse(JSON.stringify(orderData));
      const modifiedWeekData = orderDataCopy.map((item) => {
        const dateParts = item.orderDate.split("-");
        item.orderDate = dateParts[2]; // 只保留日
        return item;
      });
      return modifiedWeekData;
    },

    async changeChartData(timeRange) {
      if (timeRange === "week") {
        this.chartData = this.dateChangeWeek(this.orderData.week);
      } else if (timeRange === "month") {
        console.log("month");
        console.log("Month data:", this.orderData.month);
        this.chartData = this.dateChangeMonth(this.orderData.month);
        console.log("Changed to month range:", this.chartData);
      } else if (timeRange === "year") {
        console.log("year");
        console.log("Month data:", this.orderData.month);
        this.chartData = JSON.parse(JSON.stringify(this.orderData.year));
      }
      this.updateChart(this.chartData);
    },

    goTarget(href) {
      window.open(href, "_blank");
    },
    getUser() {
      return Promise.resolve(getUserProfile()).then((response) => {
        this.user = response.data;
        this.userId = this.user.userId;
        this.role = this.user.roles[0].roleKey;
        console.log(this.role);
        console.log(this.user.userId);
      });
    },
    connectWebSocket() {
      const userId = this.userId;
      this.message += `客户端 id = ${userId} `;

      // 判断当前浏览器是否支持WebSocket
      if ("WebSocket" in window) {
        // 改成你的地址
        this.socket = new WebSocket(
          `ws://localhost:8080/imserver/app/${userId}`
        );
      } else {
        alert("当前浏览器 Not support websocket");
        return;
      }

      // 连接发生错误的回调方法
      this.socket.onerror = () => {
        this.setMessageInnerHTML("开启订单提醒发生错误");
        // 在连接失败时弹出提示框
        this.$message.error("提醒开启失败");
      };

      // 连接成功建立的回调方法
      this.socket.onopen = () => {
        this.setMessageInnerHTML("订单提醒开启成功");
        // 在连接成功时弹出提示框
        this.$message.success("提醒开启成功");
      };

      // 接收到消息的回调方法
      this.socket.onmessage = (event) => {
        this.setMessageInnerHTML(`websocket.onmessage: ${event.data}`);
        // 在接收到消息时弹出提示框
        this.$confirm(`收到消息: ${event.data}`, "新消息", {
          confirmButtonText: "查看",
          cancelButtonText: "忽略",
          type: "info",
        })
          .then(() => {
            // 用户点击了确认按钮
            // 在这里添加页面跳转逻辑
            this.$router.push("/tfs/order");
          })
          .catch(() => {
            // 用户点击了取消按钮
            // 在这里可以添加取消时的逻辑
          });
      };

      // 连接关闭的回调方法
      this.socket.onclose = () => {
        this.setMessageInnerHTML("订单提醒已关闭");
        // 在连接关闭时弹出提示框
        this.$message.warning("提醒已关闭");
      };

      // 监听窗口关闭事件
      window.onbeforeunload = () => {
        this.closeWebSocket();
      };
    },
    closeWebSocket() {
      this.socket.close();
      // this.$message.warning("WebSocket连接已关闭");
    },
    sendMessage() {
      const message = this.text;
      try {
        this.socket.send(`{"msg":"${message}"}`);
        this.setMessageInnerHTML(`websocket.send: ${message}`);
      } catch (err) {
        console.error(`websocket.send: ${message} 失败`);
      }
    },
    setMessageInnerHTML(innerHTML) {
      this.message += innerHTML + "\n";
    },
    showCloseConfirm() {
      this.$confirm("确定要关闭订单提醒吗？", "关闭提醒", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.closeWebSocket();
      });
    },
  },
};
</script >


<style lang="less" scope>
.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
  .el-col {
    border-radius: 4px;
  }
}

.box-card {
  border-radius: 8px;
  align-items: center;
}

//实时数据展示卡片
.card-1 {
  .box-card {
    margin-top: 10px;
  }

  //数据卡片中每个卡片的样式
  .card-item {
    background-color: #f7f7f7;
    border-radius: 10px;
    // border: 0px;
    margin-bottom: 20px;
    margin-top: 20px;
  }
  .card-text {
    color: #74798c;
    text-align: center;
    display: block;
  }
  .card-data {
    margin-top: 25px;
    margin-bottom: 20px;
    text-align: center;
    display: block;
    font-size: 30px;
  }
}

//筛选数据卡片
.card-2 {
  .box-card {
    margin-left: 10px;
    margin-right: 10px;
  }
  .filter {
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .right-box {
    margin-left: auto;
    display: flex;
  }
}

//表格展示卡片
.card-3 {
  .box-card {
    margin-left: 10px;
    margin-right: 10px;
  }
  .chart {
    height: 500px;
    width: 1400px;
    position: relative; /* 相对定位 */
    margin: 0 auto; /* 水平居中 */
    margin-top: 30px;
  }
}

.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
  margin-bottom: 20px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
