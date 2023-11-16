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
      <el-form-item label="订单创建时间" prop="orderTime" label-width="100px">
        <el-date-picker
          clearable
          v-model="queryParams.orderTime"
          type="date"
          value-format="yyyy-MM-dd dd:mm:ss"
          placeholder="请选择订单创建时间"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option :key="3" :label="'待配方'" :value="3" />
          <el-option :key="4" :label="'已完成'" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--    引入订单列表-->
    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="id" />
      <el-table-column label="用户号" align="center" prop="wxUserId" />
      <el-table-column label="土壤号" align="center" prop="soilNumber" />
      <el-table-column label="配方号" align="center" prop="recipeId" v-if="false" />
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

    <!-- 添加或修改专家配方对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-descriptions title="检测单"></el-descriptions>
      <el-table :data="checkupList" style="width: 100%;margin-bottom: 10px;" border>
        <el-table-column label="检测指标名称" prop="checkupIndicatorName"></el-table-column>
        <el-table-column label="检测值" prop="checkupValue"></el-table-column>
        <el-table-column label="单位" prop="unit"></el-table-column>
      </el-table>      
      <el-descriptions title="订单详情">
        <!-- 图片 -->
        <el-descriptions-item label="采土图片">
          <el-image
            style="width: 100px; height: 100px"
            :src="soilUrl"
            :preview-src-list="[soilUrl]"
          ></el-image>
        </el-descriptions-item>
        <el-descriptions-item label="地址">{{ address }}</el-descriptions-item>
        <el-descriptions-item label="种植规模">{{ scale }} 亩</el-descriptions-item>
        <el-descriptions-item label="种植种类">{{ plantCategory }}</el-descriptions-item>
      </el-descriptions>

      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="施肥建议" prop="fertilizationAdvice">
          <el-input v-model="form.fertilizationAdvice" placeholder="请输入施肥建议" />
        </el-form-item>
        <el-form-item label="种植建议" prop="plantingAdvice">
          <el-input v-model="form.plantingAdvice" placeholder="请输入种植建议" />
        </el-form-item>
        <el-form-item label="总结" prop="summary">
          <el-input v-model="form.summary" placeholder="请输入总结" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-if="showSubmitButton">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { listRecipe, getRecipe, delRecipe, addRecipe, updateRecipe } from "@/api/tfs/recipe";
//修改为订单
import {
  listRecipe,
  getRecipe,
  delRecipe,
  addRecipe,
  updateRecipe,
  updateOrderStatus,
} from '@/api/tfs/recipe';
import { expertLook } from '@/api/tfs/recipe';

export default {
  name: 'Recipe',
  dicts: ['tfs_order_status'],
  // props:['order_id'],
  data() {
    return {
      //是否显示表单按钮
      showSubmitButton: true,
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
      //图片路径
      soilUrl: '',
      //种植种类
      plantCategory: '',
      //地址
      address: '',
      //规模
      scale: '',

      //修改为
      //待专家配方的订单的列表
      orderList: [],

      //检测单
      checkupList: [],

      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      // queryParams: {
      //   pageNum: 1,
      //   pageSize: 10,
      //   orderId: null,
      //   fertilizationAdvice: null,
      //   plantingAdvice: null,
      //   summary: null
      // },
      //修改为订单
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
      form: {
        //  自动填写id
        order_id: this.id,
      },
      // 表单校验
      rules: {
        fertilizationAdvice: [{ required: true, message: '施肥建议不能为空', trigger: 'blur' }],
        plantingAdvice: [{ required: true, message: '种植建议不能为空', trigger: 'blur' }],
        summary: [{ required: true, message: '总结不能为空', trigger: 'blur' }],
      },
    };
  },
  created() {
    this.getList();
    setInterval(this.getList, 60000);
  },
  methods: {
    /**
     * 获取检测表中的检测项
     */
    fetchCheckupList(id) {
      //获取检测单
      expertLook(id)
        .then((response) => {
          // 处理检测单列表
          this.checkupList = response.data.tfsCheckupList.map((item) => ({
            checkupIndicatorName: item.checkupIndicatorName,
            unit: item.unit,
            checkupIndicatorId: item.id,
            checkupValue: item.checkupValue,
          }));

          // 将订单详情中的其他信息赋值给对应的属性
          this.soilUrl = this.prependServerAddress(response.data.soilUrl);
          this.plantCategory = response.data.plantCategory;
          this.address = response.data.address;
          this.scale = response.data.scale;
          console.log(response.data.soilUrl, 'message');
        })
        .catch((error) => {
          console.error('Error fetching order details:', error);
        });
    },

    prependServerAddress(relativeUrl) {
      // 在这个方法中加入服务器地址
      if (relativeUrl) {
        return `http://192.168.43.229:8080${relativeUrl}`;
      }
      return ''; // 或者其他默认值
    },

    /**
     * 通过订单状态 修改按钮样式
     * @param orderStatus
     * @returns {string}
     */
    getButtonIcon(orderStatus) {
      if (orderStatus == '3') {
        return 'el-icon-check'; // 待配方状态对应的图标
      } else if (orderStatus == '4') {
        return 'el-icon-success'; // 已完成状态对应的图标
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
      if (orderStatus === '3') {
        return '提交配方'; // 待配方状态对应的按钮文字
      } else if (orderStatus === '4') {
        return '查看配方'; // 已完成状态对应的按钮文字
      }
      // 其他状态的按钮文字
      return '';
    },
    /**
     * 给不同的按钮设置不同的方法
     * @param row
     */
    handleAction(row) {
      if (row.orderStatus === '3') {
        // 执行“提交配方”操作

        this.reset();
        const id = row.id || this.ids;
        this.fetchCheckupList(id);
        // this.fetchSoilUrl(id);
        this.form.orderId = id;
        this.open = true;
        this.showSubmitButton = true;
        this.title = '添加专家配方';
        // 调用相应的方法来修改订单状态为配送完成

        // 调用相应的方法来修改订单状态为已送达
      } else if (row.orderStatus === '4') {
        // 执行“查看配方”操作
        this.reset();
        const id = row.id || this.ids;
        this.fetchCheckupList(id);
        // this.fetchSoilUrl(id);
        getRecipe(id).then((response) => {
          //判断是否查得到data（response里是否有data）
          this.form = response.data;
          this.open = true;
          this.showSubmitButton = false;
          this.title = '修改专家配方';
        });
      }
    },

    // /** 查询专家配方列表 */
    // getList() {
    //   this.loading = true;
    //   listRecipe(this.queryParams).then(response => {
    //     this.recipeList = response.rows;
    //     this.total = response.total;
    //     this.loading = false;
    //   });
    // },
    //引入订单

    /** 查询待配方订单列表 */
    getList() {
      this.loading = true;
      listRecipe(this.queryParams).then((response) => {
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
        id: null,
        orderId: null,
        fertilizationAdvice: null,
        plantingAdvice: null,
        summary: null,
      };
      this.resetForm('form');
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
    handleAdd(row) {
      this.reset();
      this.form.orderId = row.id;
      this.open = true;
      this.title = '添加专家配方';
    },
    /** 提交配方按钮操作 */
    // handleUpdate(row) {
    //   this.reset();
    //   const id = row.id || this.ids
    //   getRecipe(id).then(response => {
    //     this.form = response.data;
    //     this.open = true;
    //     this.title = "添加专家配方";
    //   });
    // },
    /**提交配方*/
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;

      getRecipe(id).then((response) => {
        //判断是否查得到data（response里是否有data）
        if (response && response.data) {
          this.form = response.data;
          this.open = true;
          this.title = '修改专家配方';
        } else {
          this.reset();
          this.form.orderId = id;
          this.open = true;
          this.title = '添加专家配方';
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateRecipe(this.form).then((response) => {
              this.$modal.msgSuccess('修改成功');
              this.open = false;

              //  修改订单状态
              updateOrderStatus(this.form.orderId, '4').then((response) => {
                // 根据返回结果执行相应操作
                //刷新列表
                this.getList();
              });
            });
          } else {
            addRecipe(this.form).then((response) => {
              this.$modal.msgSuccess('新增成功');
              this.open = false;

              //  修改订单状态
              updateOrderStatus(this.form.orderId, '4').then((response) => {
                // 根据返回结果执行相应操作
                //刷新列表
                this.getList();
              });
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除专家配方编号为"' + ids + '"的数据项？')
        .then(function () {
          return delRecipe(ids);
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
        'tfs/recipe/export',
        {
          ...this.queryParams,
        },
        `recipe_${new Date().getTime()}.xlsx`,
      );
    },
  },
};
</script>
