<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="110px">
      <el-form-item label="优惠券名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入优惠券名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="发放时间">
        <el-date-picker
          v-model="issueDateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item> -->
      <el-form-item label="开始发放时间" prop="issueBeginTime">
        <el-date-picker clearable
          v-model="queryParams.issueBeginTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择开始发放时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束发放时间" prop="issueEndTime">
        <el-date-picker clearable
          v-model="queryParams.issueEndTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择结束发放时间">
        </el-date-picker>
      </el-form-item> 
      <el-form-item label="有效期天数" prop="termDays">
        <el-input
          v-model="queryParams.termDays"
          placeholder="请输入有效期天数"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="有效期开始时间" prop="termBeginTime">
        <el-date-picker clearable
          v-model="queryParams.termBeginTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择有效期开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="有效期结束时间" prop="termEndTime">
        <el-date-picker clearable
          v-model="queryParams.termEndTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择有效期结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="创建人" prop="creater">
        <el-input
          v-model="queryParams.creater"
          placeholder="请输入创建人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择活动状态" clearable>
          <el-option
            v-for="dict in dict.type.wx_coupon_status"
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
          v-hasPermi="['wx:coupon:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wx:coupon:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wx:coupon:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['wx:coupon:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="优惠券id" align="center" prop="id" />
      <el-table-column label="优惠券名称" align="center" prop="name" width="100px"/>
      <el-table-column label="优惠券类型" align="center" prop="type" width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.type === 1 ? '普通券' : '其他类型' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="折扣类型" align="center" prop="discountType">
        <template slot-scope="scope">
          <span v-if="scope.row.discountType === 1">满减</span>
          <span v-else-if="scope.row.discountType === 2">每满减</span>
          <span v-else-if="scope.row.discountType === 3">折扣</span>
          <span v-else-if="scope.row.discountType === 4">无门槛</span>
        </template>
      </el-table-column>

      <el-table-column label="使用门槛" align="center" prop="thresholdAmount" >
        <template slot-scope="scope">
          <span v-if="scope.row.thresholdAmount === 0">无门槛</span>
          <span v-else>{{ scope.row.thresholdAmount }} 元</span>
        </template>
      </el-table-column>
      <el-table-column label="获取方式" align="center" prop="obtainWay" >
        <template slot-scope="scope">
          <span v-if="scope.row.obtainWay === 1">手动领取</span>
          <span v-else-if="scope.row.obtainWay === 2">兑换码</span>
          <span v-else>主动发放</span>
        </template>
      </el-table-column>
      <el-table-column label="开始发放时间" align="center" prop="issueBeginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.issueBeginTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束发放时间" align="center" prop="issueEndTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.issueEndTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效期天数" align="center" prop="termDays" width="100px"/>
      <el-table-column label="有效期开始时间" align="center" prop="termBeginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.termBeginTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效期结束时间" align="center" prop="termEndTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.termEndTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券状态" align="center" prop="status" width="100px">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.wx_coupon_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="总数量" align="center" prop="totalNum" />
      <el-table-column label="已发行数量" align="center" prop="issueNum" width="100px"/>
      <el-table-column label="已使用数量" align="center" prop="usedNum" width="100px"/>
      <el-table-column label="限领数量" align="center" prop="userLimit" />
      <el-table-column label="创建人" align="center" prop="creater" />
      <el-table-column label="更新人" align="center" prop="updater" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  width="120px">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-bell"
            @click="handleIssue(scope.row)"
            v-hasPermi="['wx:coupon:issue']"
          >发放</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-warning"
            @click="handleStop(scope.row)"
            v-hasPermi="['wx:coupon:stop']"
          >暂停</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['wx:coupon:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['wx:coupon:remove']"
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

    <!-- 添加或修改优惠券对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="使用门槛" prop="thresholdAmount">
          <el-radio v-model="form.thresholdAmount" label="0">无门槛</el-radio>
          <el-radio disabled v-model="form.thresholdAmount" label="1">有门槛</el-radio>
        </el-form-item>
        <el-form-item label="优惠劵类型" prop="type">
          <el-radio v-model="form.type" label="1">普通券</el-radio>
          <el-radio disabled v-model="form.type" label="2">其他券</el-radio>
        </el-form-item>
        <el-form-item label="折扣类型" prop="discountType">
          <el-radio disabled v-model="form.discountType" label="1">满减</el-radio>
          <el-radio disabled v-model="form.discountType" label="2">每满减</el-radio>
          <el-radio disabled v-model="form.discountType" label="3">折扣</el-radio>
          <el-radio v-model="form.discountType" label="4">无门槛</el-radio>
        </el-form-item>
        <el-form-item label="获取方式" prop="obtainWay">
          <el-radio v-model="form.obtainWay" label="1">手动领取</el-radio>
          <el-radio disabled v-model="form.obtainWay" label="2">兑换码</el-radio>
        </el-form-item>
        <el-form-item label="开始发放时间" prop="issueBeginTime">
          <el-date-picker clearable
            v-model="form.issueBeginTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择开始发放时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束发放时间" prop="issueEndTime">
          <el-date-picker clearable
            v-model="form.issueEndTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择结束发放时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="有效期天数" prop="termDays">
          <el-input v-model="form.termDays" placeholder="请输入有效期天数" />
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
        <el-form-item label="总数量" prop="totalNum">
          <el-input v-model="form.totalNum" placeholder="请输入总数量" />
        </el-form-item>
        <el-form-item label="限领数量" prop="userLimit">
          <el-input v-model="form.userLimit" placeholder="请输入限领数量" />
        </el-form-item>
        <el-form-item label="创建人" prop="creater">
          <el-input v-model="form.creater" placeholder="请输入创建人" />
        </el-form-item>
        <el-form-item label="更新人" prop="updater">
          <el-input v-model="form.updater" placeholder="请输入更新人" />
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
import { listCoupon, getCoupon, delCoupon, addCoupon, updateCoupon,sendCoupon,stopCoupon } from "@/api/wx/coupon";

export default {
  name: "Coupon",
  dicts: ['wx_coupon_status'],
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
      // 优惠券表格数据
      couponList: [],

      issueDateRange: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        type: null,
        discountType: null,
        obtainWay: null,
        issueBeginTime: null,
        issueEndTime: null,
        termDays: null,
        termBeginTime: null,
        termEndTime: null,
        status: null,
        creater: null,
        updater: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "优惠券名称不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "优惠券类型", trigger: "change" }
        ],
        discountType: [
          { required: true, message: "折扣类型", trigger: "change" }
        ],
        thresholdAmount: [
          { required: true, message: "使用门槛不能为空", trigger: "blur" }
        ],
        obtainWay: [
          { required: true, message: "获取方式", trigger: "change" }
        ],
        termDays: [
          { required: true, message: "有效期天数不能为空", trigger: "blur" }
        ],
        totalNum: [
          { required: true, message: "总数量不能为空", trigger: "blur" }
        ],
        userLimit: [
          { required: true, message: "限领数量不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        updateTime: [
          { required: true, message: "更新时间不能为空", trigger: "blur" }
        ],
        creater: [
          { required: true, message: "创建人不能为空", trigger: "blur" }
        ],
        updater: [
          { required: true, message: "更新人不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询优惠券列表 */
    getList() {
      this.loading = true;
      listCoupon(this.queryParams).then(response => {
        this.couponList = response.rows;
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
        name: null,
        type: null,
        discountType: null,
        thresholdAmount: null,
        obtainWay: null,
        issueBeginTime: null,
        issueEndTime: null,
        termDays: null,
        termBeginTime: null,
        termEndTime: null,
        status: null,
        totalNum: null,
        userLimit: null,
        createTime: null,
        updateTime: null,
        creater: null,
        updater: null
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
      this.title = "添加优惠券";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getCoupon(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改优惠券";
      });
    },
    /** 发放按钮操作 */
    handleIssue(row) {
      this.reset();
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认发放优惠券编号为"' + ids + '"的数据项？').then(function() {
        return sendCoupon(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("发放成功");
      }).catch(() => {});
     
    },
    /** 发放按钮操作 */
    handleStop(row) {
      this.reset();
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认暂停发放优惠券编号为"' + ids + '"的数据项？').then(function() {
        return stopCoupon(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("暂停成功");
      }).catch(() => {});
     
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCoupon(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCoupon(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除优惠券编号为"' + ids + '"的数据项？').then(function() {
        return delCoupon(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wx/coupon/export', {
        ...this.queryParams
      }, `coupon_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
