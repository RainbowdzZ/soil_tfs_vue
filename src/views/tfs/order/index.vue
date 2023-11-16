<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="订单号" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入订单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户号" prop="wxUserId">
        <el-input
          v-model="queryParams.wxUserId"
          placeholder="请输入用户号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="土壤号" prop="soilNumber">
        <el-input
          v-model="queryParams.soilNumber"
          placeholder="请输入土壤号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px" label="订单创建时间" prop="orderTime">
        <el-date-picker
          clearable
          v-model="queryParams.orderTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择订单创建时间"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="dict in dict.type.tfs_order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['tfs:order:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['tfs:order:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['tfs:order:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['tfs:order:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="id" />
      <el-table-column label="用户号" align="center" prop="wxUserId" />
      <el-table-column label="土壤号" align="center" prop="soilNumber" />
      <el-table-column label="快递号" align="center" prop="courierNumber" />
      <el-table-column label="配送方式" align="center" prop="shippingType">
        <template slot-scope="scope">
          <span v-if="scope.row.shippingType === 0">邮寄配送</span>
          <span v-else-if="scope.row.shippingType === 1">线下配送</span>
        </template>
      </el-table-column>
      <el-table-column label="订单创建时间" align="center" prop="orderTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.tfs_order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            :icon="getButtonIcon(scope.row.orderStatus)"
            @click="handleAction(scope.row)"
            v-hasPermi="['tfs:order:edit']"
            >{{ getButtonText(scope.row.orderStatus) }}</el-button
          >

          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['tfs:order:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form :model="form" label-width="120px" class="dynamic-form">
        <!-- 添加订单号 -->
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单号" />
        </el-form-item>
        <!-- 动态生成的表单项 -->
        <el-form-item
          style="width: 80%"
          v-for="(item, index) in indicators"
          :key="index"
          class="form-row"
          :label="item.indicatorName"
          :prop="item.checkupIndicatorId.toString()"
          :rules="[
            { required: true, message: '请输入检测数值', trigger: 'blur' },
            { type: 'number', message: '请输入数字值', trigger: 'blur' },
            {
              min: 0,
              type: 'number',
              max: 999.99,
              message: '请输入0到1000以内的数值',
              trigger: 'blur',
            },
            {
              validator: (rule, value, callback) => {
                const pattern = /^\d+(\.\d{1,2})?$/;
                if (!pattern.test(value.toString())) {
                  callback('请输入最多两位小数的数值');
                } else {
                  callback();
                }
              },
              trigger: 'blur',
            },
          ]"
        >
          <div style="display: flex; align-items: center">
            <el-input
              v-model.number="form[item.checkupIndicatorId.toString()]"
              type="number"
              :min="0"
              :max="1000"
              :step="0.01"
              placeholder="请输入检测数值"
            ></el-input>
            <span style="margin-left: 10px;width: 60px;">{{ item.unit }}</span>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>





<script>
import {
  listOrder,
  getOrder,
  delOrder,
  addOrder,
  updateOrder,
  updateOrderStatus,
} from '@/api/tfs/order';
import { listIndicator1 } from '@/api/tfs/indicator';
import { addCheckup } from '@/api/tfs/checkup';
export default {
  name: 'Order',
  dicts: ['tfs_order_status'],
  //数据过滤
  // computed: {
  //   filteredIndicators: {
  //     get() {
  //       return this.rows
  //         .filter(item => item.status === "1")
  //         .map(item => ({ name: item.indicatorName, unit: item.unit }));
  //     },
  //     set(value) {
  //       // 这里可以根据需要添加设置操作
  //     }
  //   }
  // },

  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 订单管理表格数据
      orderList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        wxUserId: null,
        soilNumber: null,
        orderTime: null,
        orderStatus: null,
      },
      // 表单参数
      form: {},
      indicators: [],
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.getList();
    this.fetchIndicators();
    setInterval(this.getList, 60000);
  },
  methods: {
    /**
     * 获取检测指标表中的检测项
     */
    fetchIndicators() {
      listIndicator1({})
        .then((response) => {
          this.indicators = response.rows.map((item) => ({
            indicatorName: item.indicatorName,
            unit: item.unit,
            checkupIndicatorId: item.id,
          }));
        })
        .catch((error) => {
          console.error('Error fetching indicators:', error);
        });
    },
    /**
     * 过滤器
     */

    /**
     * 通过订单状态 修改按钮样式
     * @param orderStatus
     * @returns {string}
     */
    getButtonIcon(orderStatus) {
      if (orderStatus == '1') {
        return 'el-icon-check'; // 待送检状态对应的图标
      } else if (orderStatus == '2') {
        return 'el-icon-edit'; // 待检测状态对应的图标
      } else if (orderStatus == '3') {
        return 'el-icon-check'; // 待配方状态对应的图标
      } 
      // 其他状态的图标
      return '';
    },
    /**
     * 通过订单状态修改按钮文字
     * @param orderStatus
     * @returns {string}
     */
    getButtonText(orderStatus) {
      if (orderStatus === '1') {
        return '已送达'; // 待送检状态对应的按钮文字
      } else if (orderStatus === '2') {
        return '提交检测'; // 待配方状态对应的按钮文字
      } else if (orderStatus === '3') {
        return '等待配方'; // 待配方状态对应的按钮文字
      } 
      // 其他状态的按钮文字
      return '';
    },
    /**
     * 给不同的按钮设置不同的方法
     * @param row
     */
    handleAction(row) {
      if (row.orderStatus === '1') {
        // 执行“已送达”操作
        const id = row.id || this.ids;
        updateOrderStatus(id, '2').then((response) => {
          this.getList();
        });
        // 调用相应的方法来修改订单状态为已送达
      } else if (row.orderStatus === '2') {
        // 执行“提交检测单”操作
        this.reset();
        const id = row.id || this.ids;
        this.form.orderId = id;
        this.open = true;
        this.title = '添加检测';
        // 调用相应的方法来修改订单状态为配送完成
      } else if (row.orderStatus === '4') {
        // 执行“确认完成”操作
        // 调用相应的方法来确认订单已完成
      }
      // 其他状态的处理逻辑
    },
    /** 查询订单管理列表 */
    getList() {
      this.loading = true;
      listOrder(this.queryParams).then((response) => {
        this.orderList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        // id: null,
        // wxUserId: null,
        // soilNumber: null,
        // orderTime: null,
        // orderStatus: null,
        // recipeId: null,
        // checkupId: null
      };
      this.fetchIndicators();
      this.indicators.forEach((item) => {
        item.value = null;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = '添加订单管理';
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getOrder(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = '修改订单管理';
      });
    },
    /**
     * 提交检测单
     */

    submitForm() {
      // 遍历检测项
      for (let i = 0; i < this.indicators.length; i++) {
        const data = {
          orderId: this.form.orderId,
          checkupIndicatorId: this.indicators[i].checkupIndicatorId,
          checkupIndicatorName: this.indicators[i].indicatorName,
          unit: this.indicators[i].unit,
          checkupValue: this.form[this.indicators[i].checkupIndicatorId.toString()],
        };
        try {
          addCheckup(data)
            .then((response) => {
              console.log('Add checkup response:', response);
              // 处理响应
            })
            .catch((error) => {
              console.error('Error adding checkup:', error);
            });
        } catch (error) {
          console.error('Error adding checkup:', error);
        }
      }
      // 处理错误
      // addCheckup(this.form).then(response => {
      this.$modal.msgSuccess('新增成功');
      this.open = false;
      // });
      //  修改订单状态
      updateOrderStatus(this.form.orderId, '3').then((response) => {
        // 根据返回结果执行相应操作
        //刷新列表
        this.getList();
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除订单管理编号为"' + ids + '"的数据项？')
        .then(function () {
          return delOrder(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('删除成功');
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'tfs/order/export',
        {
          ...this.queryParams,
        },
        `order_${new Date().getTime()}.xlsx`,
      );
    },
  },
};
</script>
