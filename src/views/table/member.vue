<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加用户</el-button>
    </div>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label='memberID' width="95">
        <template slot-scope="scope">
          <span>{{scope.row.memberId}}</span>
        </template>
      </el-table-column>

      <el-table-column label="帐号" width="110" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.account}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="类型" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.userType | userTypeFilter}}
        </template>
      </el-table-column>
      <el-table-column label="手机" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.phone}}
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.email}}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.state | statusFilter}}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建日期" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | formatTime}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="action" label="操作" width="230">
        <template slot-scope="scope">
          <span>
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.state =='1'" size="mini" @click="handleModifyState(scope.row,'0')">禁用</el-button>
            <el-button v-if="scope.row.state =='0'" size="mini" type="danger" @click="handleModifyState(scope.row,'1')">启用</el-button>
          </span>
        </template>
      </el-table-column>
  
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        
        <el-form-item label="帐号" prop="account">
            <el-input  v-if="dialogStatus=='create'" v-model="temp.account"></el-input>
            <el-input  v-else readonly v-model="temp.account"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="temp.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" type="email" :rules="[ { required: true, message: '请输入邮箱地址', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }]"></el-input>
        </el-form-item>
        
        <el-form-item v-if="dialogStatus=='create'" label="类型">
          <el-select class="filter-item" v-model="temp.userType" placeholder="Please select">
            <el-option v-for="item in userTypeOptions" :key="item.key" :label="item.value" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">更新</el-button>
      </div>
    </el-dialog>
  
  </div>
</template>


<script>
import { fetchMemberList, createMember, updateMember, updateMemberState } from '@/api/member'
import { parseTime } from '@/utils/index'

const userTypeOptions = [
  { key: 1, value: '开发者' },
  { key: 2, value: '服务商' },
  { key: 3, value: '管理员' }
]

export default {
  data() {
    return {
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      temp: {
        memberId: undefined,
        memberName: '',
        sortIndex: 0,
        iconUrl: '',
        processName: '',
        state: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '添加用户'
      },
      statusOptions: [{
        key: '1',
        value: '启用'
      },
      {
        key: '0',
        value: '禁用'
      }],
      userTypeOptions,
      listLoading: true
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '开启',
        0: '关闭'
      }
      return statusMap[status]
    },
    userTypeFilter(type) {
      const typeNames = ['', '开发者', '服务商', '管理员']
      return typeNames[type]
    },
    formatTime(mills) {
      return parseTime(mills)
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      fetchMemberList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.page.countTotal
        this.listLoading = false
      }).catch(function(err) {
        console.trace(err)
      })
    },
    getList() {
      this.listLoading = true
      fetchMemberList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.page.countTotal

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 200)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    resetTemp() {
      this.temp = {
        memberId: undefined,
        memberName: '',
        iconUrl: '',
        processName: '',
        sortIndex: 0,
        state: 1
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createMember(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleModifyState(row, status) {
      row.state = status
      updateMemberState(row).then(() => {
        for (const v of this.list) {
          if (v.memberId === row.memberId) {
            const index = this.list.indexOf(v)
            this.list.splice(index, 1, row)
            break
          }
        }
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.password = ''
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateMember(tempData).then(() => {
            for (const v of this.list) {
              if (v.memberId === this.temp.memberId) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    }
  }
}
</script>
