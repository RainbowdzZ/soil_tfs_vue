<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户id" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户id"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系人" prop="consignee">
        <el-input
          v-model="queryParams.consignee"
          placeholder="请输入联系人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="省级名称" prop="provinceName">
        <el-input
          v-model="queryParams.provinceName"
          placeholder="请输入省级名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="市级名称" prop="cityName">
        <el-input
          v-model="queryParams.cityName"
          placeholder="请输入市级名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="区级名称" prop="districtName">
        <el-input
          v-model="queryParams.districtName"
          placeholder="请输入区级名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['wx:farm:add']"
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
          v-hasPermi="['wx:farm:edit']"
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
          v-hasPermi="['wx:farm:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['wx:farm:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="farmList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="用户id" align="center" prop="userId" />
      <el-table-column label="联系人" align="center" prop="consignee" />
      <el-table-column label="手机号" align="center" prop="phone" width="110px"/>
      <el-table-column label="省级名称" align="center" prop="provinceName" />
      <el-table-column label="市级名称" align="center" prop="cityName" />
      <el-table-column label="区级名称" align="center" prop="districtName" />
      <el-table-column label="详细地址" align="center" prop="detail" />
      <el-table-column label="默认地址" align="center" prop="isDefault" />
      <el-table-column label="种植种类" align="center" prop="plantCategory" />
      <el-table-column label="种植规模" align="center" prop="scale" />
      <el-table-column label="创建人" align="center" prop="creater" />
      <el-table-column label="更新人" align="center" prop="updater" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  width="110px">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['wx:farm:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['wx:farm:remove']"
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

    <!-- 添加或修改农场管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户id" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户id" />
        </el-form-item>
        <el-form-item label="收件人" prop="consignee">
          <el-input v-model="form.consignee" placeholder="请输入收件人" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省级名称" prop="provinceName">
          <el-input v-model="form.provinceName" placeholder="请输入省级名称" />
        </el-form-item>
        <el-form-item label="市级名称" prop="cityName">
          <el-input v-model="form.cityName" placeholder="请输入市级名称" />
        </el-form-item>
        <el-form-item label="区级名称" prop="districtName">
          <el-input v-model="form.districtName" placeholder="请输入区级名称" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="form.detail" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="默认地址" prop="isDefault">
          <el-input v-model="form.isDefault" placeholder="请输入默认地址" />
        </el-form-item>
        <el-form-item label="种植种类" prop="plantCategory">
          <el-input v-model="form.plantCategory" placeholder="请输入种植种类" />
        </el-form-item>
        <el-form-item label="种植规模" prop="scale">
          <el-input v-model="form.scale" placeholder="请输入种植规模" />
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
import { listFarm, getFarm, delFarm, addFarm, updateFarm } from "@/api/wx/farm";

export default {
  name: "Farm",
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
      // 农场管理表格数据
      farmList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        consignee: null,
        phone: null,
        provinceName: null,
        cityName: null,
        districtName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户id不能为空", trigger: "blur" }
        ],
        consignee: [
          { required: true, message: "收件人不能为空", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "手机号不能为空", trigger: "blur" }
        ],
        isDefault: [
          { required: true, message: "默认地址不能为空", trigger: "blur" }
        ],
        plantCategory: [
          { required: true, message: "种植种类不能为空", trigger: "blur" }
        ],
        scale: [
          { required: true, message: "种植规模不能为空", trigger: "blur" }
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
        ],
        isDeleted: [
          { required: true, message: "是否删除不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询农场管理列表 */
    getList() {
      this.loading = true;
      listFarm(this.queryParams).then(response => {
        this.farmList = response.rows;
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
        consignee: null,
        phone: null,
        provinceName: null,
        cityName: null,
        districtName: null,
        detail: null,
        isDefault: null,
        plantCategory: null,
        scale: null,
        createTime: null,
        updateTime: null,
        creater: null,
        updater: null,
        isDeleted: null
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
      this.title = "添加农场管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getFarm(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改农场管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateFarm(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addFarm(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除农场管理编号为"' + ids + '"的数据项？').then(function() {
        return delFarm(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wx/farm/export', {
        ...this.queryParams
      }, `farm_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
