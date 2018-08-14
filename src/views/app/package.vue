<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加游戏</el-button>
    </div>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label='gameID' width="95">
        <template slot-scope="scope">
          <span>{{scope.row.gameId}}</span>
        </template>
      </el-table-column>

      <el-table-column label="游戏名" width="110" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.gameName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="进程exe" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.processName}}
        </template>
      </el-table-column>
      <el-table-column label="图标" width="110" align="center">
        <template slot-scope="scope">
         <img class="default-image" :src=scope.row.iconUrl />
        </template>
      </el-table-column>
      <el-table-column label="排序索引" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.sortIndex}}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.state | statusFilter}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="updateTime" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.updateTime | formatTime}}</span>
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
        
        <el-form-item label="游戏名" prop="gameName">
            <el-input v-model="temp.gameName"></el-input>
        </el-form-item>
        <el-form-item label="进程exe" prop="processName">
          <el-input v-model="temp.processName"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="iconUrl">
          <el-input v-model="temp.iconUrl"></el-input>
        </el-form-item>
        <el-form-item label="位置id" prop="sortIndex">
          <el-input v-model="temp.sortIndex"></el-input>
        </el-form-item>
        <!--
        <el-form-item label="状态">
          <el-select class="filter-item" v-model="temp.state" placeholder="Please select">
            <el-option v-for="item in  statusOptions" :key="item.key" :label="item.value" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        -->
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
import { fetchGameList, createGame, updateGame, updateGameState } from '@/api/game'
import { parseTime } from '@/utils/index'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
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
        gameId: undefined,
        gameName: '',
        sortIndex: 0,
        iconUrl: '',
        processName: '',
        state: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑游戏',
        create: '添加游戏'
      },
      statusOptions: [{
        key: '1',
        value: '启用'
      },
      {
        key: '0',
        value: '禁用'
      }],
      calendarTypeOptions,
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
      fetchGameList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.page.countTotal
        this.listLoading = false
      }).catch(function(err) {
        console.trace(err)
      })
    },
    getList() {
      this.listLoading = true
      fetchGameList(this.listQuery).then(response => {
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
        gameId: undefined,
        gameName: '',
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
          createGame(this.temp).then(() => {
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
      updateGameState(row).then(() => {
        for (const v of this.list) {
          if (v.id === row.id) {
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
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateGame(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
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
