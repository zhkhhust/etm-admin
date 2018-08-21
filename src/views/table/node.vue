<template>
  <div class="app-container">
    
    <div class="filter-container">

      <el-select clearable class="filter-item" v-model="listQuery.state" placeholder="状态">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.value" :value="item.key">
        </el-option>
      </el-select>

      <el-select clearable class="filter-item" v-model="listQuery.ownerId" placeholder="提供者">
        <el-option v-for="item in providers" :key="item.memberId" :label="item.account" :value="item.memberId">
        </el-option>
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-add">添加节点</el-button>
    </div>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label='nodeID' width="95">
        <template slot-scope="scope">
          <span>{{scope.row.nodeId}}</span>
        </template>
      </el-table-column>

      <el-table-column label="IP" width="110" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.ip}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="端口" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.port}}
        </template>
      </el-table-column>
      <el-table-column label="Dapp密码" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.masterPassword}}
        </template>
      </el-table-column>
      <el-table-column label="系统" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.os}}
        </template>
      </el-table-column>
      <el-table-column label="所有者" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.owner}}
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
        
        <el-form-item label="IP" prop="ip"> 
            <el-input  v-model="temp.ip"></el-input>
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="temp.port" type="number"></el-input>
        </el-form-item>
        <el-form-item label="Dapp密码" prop="password">
          <el-input v-model="temp.masterPassword" ></el-input>
        </el-form-item>
        <el-form-item label="系统" prop="os">
          <el-input v-model="temp.os"></el-input>
        </el-form-item>
        <el-form-item label="所有者" prop="ownerId">
          <el-select clearable style="width: 200px" class="filter-item" v-model="temp.ownerId" placeholder="所有者">
            <el-option v-for="item in providers" :key="item.memberId" :label="item.account" :value="item.memberId">
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
import { fetchMemberList } from '@/api/member'
import { fetchNodeList, createNode, updateNode, updateNodeState } from '@/api/etmNode'
import { parseTime } from '@/utils/index'

export default {
  data() {
    return {
      list: null,
      providers: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '-createTime'
      },
      temp: {
        nodeId: undefined,
        ip: '',
        port: 0,
        os: '',
        masterPassword: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑节点',
        create: '添加节点'
      },
      statusOptions: [{
        key: '1',
        value: '启用'
      },
      {
        key: '0',
        value: '禁用'
      }],
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
      fetchNodeList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.page.countTotal
        this.listLoading = false
      }).catch(function(err) {
        console.trace(err)
      })
      fetchMemberList({ userType: 2, limit: 10000 }).then(response => {
        this.providers = response.data.list
      }).catch(function(err) {
        console.trace(err)
      })
    },
    getList() {
      this.listLoading = true
      fetchNodeList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.page.countTotal

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
        nodeId: undefined,
        nodeName: '',
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
          createNode(this.temp).then((res) => {
            this.temp.nodeId = res.data
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
      updateNodeState(row).then(() => {
        for (const v of this.list) {
          if (v.nodeId === row.nodeId) {
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
          tempData.createTime = null
          tempData.updateTime = null
          updateNode(tempData).then(() => {
            for (const v of this.list) {
              if (v.nodeId === this.temp.nodeId) {
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
