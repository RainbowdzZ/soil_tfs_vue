<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优惠券号" prop="couponId">
        <el-input
          v-model="queryParams.couponId"
          placeholder="请输入优惠券号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="券状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择优惠券状态" clearable>
          <el-option
            v-for="dict in dict.type.wx_user_conpon_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
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
          v-hasPermi="['wx:usercoupon:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:usercoupon:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['wx:usercoupon:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="usercouponList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="id" align="center" prop="id" /> -->
      <el-table-column label="用户号" align="center" prop="userId" />
      <el-table-column label="优惠券号" align="center" prop="couponId" />
      <el-table-column label="有效期开始时间" align="center" prop="termBeginTime" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.termBeginTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效期结束时间" align="center" prop="termEndTime" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.termEndTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用时间" align="center" prop="usedTime" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.usedTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券状态" align="center" prop="status" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.wx_user_conpon_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="center" prop="orderId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['wx:usercoupon:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['wx:usercoupon:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改优惠券历史对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="用户号" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户号" />
        </el-form-item>
        <el-form-item label="优惠券号" prop="couponId">
          <el-input v-model="form.couponId" placeholder="请输入优惠券号" />
        </el-form-item>
        <el-form-item label="有效期开始时间" prop="termBeginTime">
          <el-date-picker clearable
            v-model="form.termBeginTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择有效期开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="有效期结束时间" prop="termEndTime">
          <el-date-picker clearable
            v-model="form.termEndTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择有效期结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="使用时间" prop="usedTime">
          <el-date-picker clearable
            v-model="form.usedTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择使用时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUsercoupon, getUsercoupon, delUsercoupon, addUsercoupon, updateUsercoupon } from "@/api/wx/usercoupon";

export default {
  name: "Usercoupon",
  dicts: ['wx_user_conpon_status'],
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
      // 优惠券历史表格数据
      usercouponList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        couponId: null,
        orderId: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户id不能为空", trigger: "blur" }
        ],
        couponId: [
          { required: true, message: "优惠券id不能为空", trigger: "blur" }
        ],
        termEndTime: [
          { required: true, message: "有效期结束时间不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "优惠券状态，1：未使用，2：已使用，3：已失效不能为空", trigger: "change" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        updateTime: [
          { required: true, message: "更新时间不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询优惠券历史列表 */
    getList() {
      this.loading = true;
      listUsercoupon(this.queryParams).then(response => {
        this.usercouponList = response.rows;
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
        userId: null,
        couponId: null,
        termBeginTime: null,
        termEndTime: null,
        usedTime: null,
        status: null,
        createTime: null,
        updateTime: null,
        orderId: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加优惠券历史";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getUsercoupon(id).then(response => {
        console.log(response);
        this.form = response.data;
        this.open = true;
        this.title = "修改优惠券历史";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateUsercoupon(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUsercoupon(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除优惠券历史编号为"' + ids + '"的数据项？').then(function() {
        return delUsercoupon(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wx/usercoupon/export', {
        ...this.queryParams
      }, `usercoupon_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
