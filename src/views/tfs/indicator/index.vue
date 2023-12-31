<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="指标名称" prop="indicatorName">
        <el-input
          v-model="queryParams.indicatorName"
          placeholder="请输入指标名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input
          v-model="queryParams.unit"
          placeholder="请输入单位"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createdAt">
        <el-date-picker clearable
                        v-model="queryParams.createdAt"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择创建时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间" prop="updatedAt">
        <el-date-picker clearable
                        v-model="queryParams.updatedAt"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择更新时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dict.type.checkup_indicator_status"
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
          v-hasPermi="['tfs:indicator:add']"
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
          v-hasPermi="['tfs:indicator:edit']"
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
          v-hasPermi="['tfs:indicator:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['tfs:indicator:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="indicatorList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="检测指标号" align="center" prop="id" />
      <el-table-column label="指标名称" align="center" prop="indicatorName" />
      <el-table-column label="单位" align="center" prop="unit" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.checkup_indicator_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['tfs:indicator:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['tfs:indicator:remove']"
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

    <!-- 添加或修改检测指标管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width=auto>
        <el-form-item label="指标名称" prop="indicatorName">
          <el-input v-model="form.indicatorName" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.checkup_indicator_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="1级标准最小值" prop="level1Min">
          <el-input v-model="form.level1Min" placeholder="请输入1级最小值" />
        </el-form-item>
        <el-form-item label="1级标准最大值" prop="level1Max">
          <el-input v-model="form.level1Max" placeholder="请输入1级最大值" />
        </el-form-item>
        <el-form-item label="2级标准最小值" prop="level2Min">
          <el-input v-model="form.level2Min" placeholder="请输入2级最小值" />
        </el-form-item>
        <el-form-item label="2级标准最大值" prop="level2Max">
          <el-input v-model="form.level2Max" placeholder="请输入2级最大值" />
        </el-form-item>
        <el-form-item label="3级标准最小值" prop="level3Min">
          <el-input v-model="form.level3Min" placeholder="请输入3级最小值" />
        </el-form-item>
        <el-form-item label="3级标准最大值" prop="level3Max">
          <el-input v-model="form.level3Max" placeholder="请输入3级最大值" />
        </el-form-item>
        <el-form-item label="4级标准最小值" prop="level4Min">
          <el-input v-model="form.level4Min" placeholder="请输入4级最小值" />
        </el-form-item>
        <el-form-item label="4级标准最大值" prop="level4Max">
          <el-input v-model="form.level4Max" placeholder="请输入4级最大值" />
        </el-form-item>
        <el-form-item label="5级标准最小值" prop="level5Min">
          <el-input v-model="form.level5Min" placeholder="请输入5级最小值" />
        </el-form-item>
        <el-form-item label="5级标准最大值" prop="level5Max">
          <el-input v-model="form.level5Max" placeholder="请输入5级最大值" />
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
import { listIndicator, getIndicator, delIndicator, addIndicator, updateIndicator } from "@/api/tfs/indicator";

export default {
  name: "Indicator",
  dicts: ['checkup_indicator_status'],
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
      // 检测指标管理表格数据
      indicatorList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        indicatorName: null,
        unit: null,
        createdAt: null,
        updatedAt: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        indicatorName: [
          { required: true, message: "指标名称不能为空", trigger: "blur" }
        ],
        unit: [
          { required: true, message: "单位不能为空", trigger: "blur" }
        ],
        level1Min: [
          { required: true, message: "1级最小值不能为空", trigger: "blur" }
        ],
        level1Max: [
          { required: true, message: "1级最大值不能为空", trigger: "blur" }
        ],
        level2Min: [
          { required: true, message: "2级最小值不能为空", trigger: "blur" }
        ],
        level2Max: [
          { required: true, message: "2级最大值不能为空", trigger: "blur" }
        ],
        level3Min: [
          { required: true, message: "3级最小值不能为空", trigger: "blur" }
        ],
        level3Max: [
          { required: true, message: "3级最大值不能为空", trigger: "blur" }
        ],
        level4Min: [
          { required: true, message: "1级最小值不能为空", trigger: "blur" }
        ],
        level4Max: [
          { required: true, message: "4级最大值不能为空", trigger: "blur" }
        ],
        level5Min: [
          { required: true, message: "5级最小值不能为空", trigger: "blur" }
        ],
        level5Max: [
          { required: true, message: "5级最大值不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询检测指标管理列表 */
    getList() {
      this.loading = true;
      listIndicator(this.queryParams).then(response => {
        this.indicatorList = response.rows;
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
        indicatorName: null,
        unit: null,
        createdAt: null,
        updatedAt: null,
        status: null,
        level1Min: null,
        level1Max: null,
        level2Min: null,
        level2Max: null,
        level3Min: null,
        level3Max: null,
        level4Min: null,
        level4Max: null,
        level5Min: null,
        level5Max: null
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
      this.title = "添加检测指标管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getIndicator(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改检测指标管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateIndicator(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addIndicator(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除检测指标管理编号为"' + ids + '"的数据项？').then(function() {
        return delIndicator(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('tfs/indicator/export', {
        ...this.queryParams
      }, `indicator_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
