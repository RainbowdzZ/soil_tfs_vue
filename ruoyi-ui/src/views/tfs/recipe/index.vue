<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
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
      <el-form-item label="订单创建时间" prop="orderTime">
        <el-date-picker clearable
                        v-model="queryParams.orderTime"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择订单创建时间">
        </el-date-picker>
      </el-form-item>
      <!--      <el-form-item label="施肥建议" prop="fertilizationAdvice">-->
<!--        <el-input-->
<!--          v-model="queryParams.fertilizationAdvice"-->
<!--          placeholder="请输入施肥建议"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="种植建议" prop="plantingAdvice">-->
<!--        <el-input-->
<!--          v-model="queryParams.plantingAdvice"-->
<!--          placeholder="请输入种植建议"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="总结" prop="summary">-->
<!--        <el-input-->
<!--          v-model="queryParams.summary"-->
<!--          placeholder="请输入总结"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="el-icon-plus"-->
<!--          size="mini"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['tfs:recipe:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['tfs:recipe:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['tfs:recipe:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['tfs:recipe:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

<!--    <el-table v-loading="loading" :data="recipeList" @selection-change="handleSelectionChange">-->
<!--      <el-table-column type="selection" width="55" align="center" />-->
<!--      <el-table-column label="配方号" align="center" prop="id" />-->
<!--      <el-table-column label="订单号" align="center" prop="orderId" />-->
<!--      <el-table-column label="施肥建议" align="center" prop="fertilizationAdvice" />-->
<!--      <el-table-column label="种植建议" align="center" prop="plantingAdvice" />-->
<!--      <el-table-column label="总结" align="center" prop="summary" />-->
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--        <template slot-scope="scope">-->
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-edit"-->
<!--            @click="handleUpdate(scope.row)"-->
<!--            v-hasPermi="['tfs:recipe:edit']"-->
<!--          >修改</el-button>-->
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-delete"-->
<!--            @click="handleDelete(scope.row)"-->
<!--            v-hasPermi="['tfs:recipe:remove']"-->
<!--          >删除</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--    </el-table>-->





<!--    引入订单列表-->
    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="id" />
      <el-table-column label="用户号" align="center" prop="wxUserId" />
      <el-table-column label="土壤号" align="center" prop="soilNumber" />
      <el-table-column label="配方号" align="center" prop="recipeId" v-if="false" />
      <el-table-column label="订单创建时间" align="center" prop="orderTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.tfs_order_status" :value="scope.row.orderStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['tfs:recipe:update']"
          >提交配方</el-button>

<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-edit"-->
<!--            @click="handleUpdate(scope.row)"-->
<!--            v-hasPermi="['tfs:order:edit']"-->
<!--          >修改</el-button>-->
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-delete"-->
<!--            @click="handleDelete(scope.row)"-->
<!--            v-hasPermi="['tfs:order:remove']"-->
<!--          >删除</el-button>-->
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

    <!-- 添加或修改专家配方对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { listRecipe, getRecipe, delRecipe, addRecipe, updateRecipe } from "@/api/tfs/recipe";
//修改为订单
import { listRecipe, getRecipe, delRecipe, addRecipe, updateRecipe,updateOrderStatus } from "@/api/tfs/recipe";


export default {
  name: "Recipe",
  dicts: ['tfs_order_status'],
  // props:['order_id'],
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
      // // 专家配方表格数据
      // recipeList: [],




      //修改为
      //待专家配方的订单的列表
      orderList:[],




      // 弹出层标题
      title: "",
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
        order_id:this.id
      },
      // 表单校验
      rules: {
        fertilizationAdvice: [
          { required: true, message: "施肥建议不能为空", trigger: "blur" }
        ],
        plantingAdvice: [
          { required: true, message: "种植建议不能为空", trigger: "blur" }
        ],
        summary: [
          { required: true, message: "总结不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
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
      listRecipe(this.queryParams).then(response => {
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
        summary: null
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
    handleAdd(row) {
      this.reset();
      this.form.orderId=row.id;
      this.open =true;
      this.title ="添加专家配方"
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
      const id = row.id || this.ids

      getRecipe(id).then(response => {
        //判断是否查得到data（response里是否有data）
        if (response && response.data){
            this.form = response.data;
            this.open = true;
            this.title = "修改专家配方";
          }
          else{
            this.reset();
            this.form.orderId=id;
            this.open =true;
            this.title ="添加专家配方"
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRecipe(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            //  修改订单状态
              updateOrderStatus(this.form.orderId, 4).then(response => {
                // 根据返回结果执行相应操作
              });
            });
          } else {
            addRecipe(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              //  修改订单状态
              updateOrderStatus(this.form.orderId, 4).then(response => {
                // 根据返回结果执行相应操作
              });

            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除专家配方编号为"' + ids + '"的数据项？').then(function() {
        return delRecipe(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('tfs/recipe/export', {
        ...this.queryParams
      }, `recipe_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
