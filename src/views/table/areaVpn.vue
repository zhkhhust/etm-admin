<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-select clearable @change='handleGameChange' style="width: 90px" class="filter-item" v-model="listQuery.gameId" placeholder="游戏">
        <el-option v-for="item in gameList" :key="item.gameId" :label="item.gameName" :value="item.gameId">
        </el-option>
      </el-select>

      <el-select clearable style="width: 90px" class="filter-item" v-model="listQuery.areaId" placeholder="区服">
        <el-option v-for="item in gameAreaList" :key="item.id" :label="item.areaName" :value="item.id">
        </el-option>
      </el-select>

      <el-select clearable style="width: 90px" class="filter-item" v-model="listQuery.configid" placeholder="线路">
        <el-option v-for="item in vpnServerList" :key="item.configid" :label="item.configid" :value="item.configid">
        </el-option>
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加区服线路</el-button>
    </div>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label='id' width="95">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>

      <el-table-column label="游戏名" width="110" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.gameName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="区服名" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.areaName}}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.state | statusFilter}}
        </template>
      </el-table-column>
      <el-table-column label="配置id" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.configid}}
        </template>
      </el-table-column>
      <el-table-column label="配置名" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.configName}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="des" label="描述" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.des }}</span>
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
        
        <el-form-item label="游戏" prop="gameId">
          <el-select clearable @change='handleDialogGameChange' style="width: 200px" class="filter-item" v-model="temp.gameId" placeholder="游戏">
            <el-option v-for="item in gameList" :key="item.gameId" :label="item.gameName" :value="item.gameId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区服" prop="areaId">
          <el-select clearable style="width: 200px" class="filter-item" v-model="temp.areaId" placeholder="区服">
            <el-option v-for="item in dialogGameAreaList" :key="item.id" :label="item.areaName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配置id" prop="configid">
          <el-select clearable style="width: 200px" class="filter-item" v-model="temp.configid" placeholder="配置">
            <el-option v-for="item in vpnServerList" :key="item.configid" :label="item.configid" :value="item.configid">
            </el-option>
          </el-select>
        </el-form-item>
        <!--
        <el-form-item label="状态">
          <el-select class="filter-item" v-model="temp.state" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.value" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        -->
        <el-form-item label="描述" prop="des">
          <el-input v-model="temp.des"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
        <el-button v-else type="primary" @click="updateData">更新</el-button>
      </div>
    </el-dialog>
  
  </div>
</template>


<script>
import { fetchAreaVpnList, createAreaVpn, updateAreaVpn, updateAreaVpnState } from '@/api/areaVpn'
import { fetchGameList } from '@/api/game'
import { fetchGameAreaList } from '@/api/gameArea'
import { fetchVpnServerList } from '@/api/vpnServer'

export default {
  data() {
    return {
      list: null,
      gameList: null,
      gameAreaList: null,
      dialogGameAreaList: null,
      vpnServerList: null,
      total: 0,
      listQuery: {
        page: 1,
        pageSize: 10,
        gameId: undefined,
        areaId: undefined,
        configid: undefined,
        sort: '+id'
      },
      temp: {
        gameId: undefined,
        areaId: undefined,
        configid: undefined,
        state: '1',
        des: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑区服线路',
        create: '创建区服线路'
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
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      fetchGameList({ limit: 10000 }).then(response => {
        this.gameList = response.data
      }).catch(function(err) {
        console.trace(err)
      })
      /*
      fetchGameAreaList().then(response => {
        this.list = response.data
        this.gameList = response.data
        this.listLoading = false
      }).catch(function(err) {
        console.trace(err)
      })
      */
      fetchVpnServerList({ limit: 10000 }).then(response => {
        this.vpnServerList = response.data
      }).catch(function(err) {
        console.trace(err)
      })
      fetchAreaVpnList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.page.countTotal
        this.listLoading = false
      }).catch(function(err) {
        console.trace(err)
      })
    },
    getList() {
      this.listLoading = true
      fetchAreaVpnList(this.listQuery).then(response => {
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
    handleGameChange() {
      fetchGameAreaList({ 'gameId': this.listQuery.gameId }).then(response => {
        this.dialogGameAreaList = response.data
      }).catch(function(err) {
        console.trace(err)
      })
    },
    handleDialogGameChange() {
      fetchGameAreaList({ 'gameId': this.temp.gameId }).then(response => {
        this.dialogGameAreaList = response.data
      }).catch(function(err) {
        console.trace(err)
      })
    },
    resetTemp() {
      this.temp = {
        gameId: undefined,
        areaId: undefined,
        configid: undefined,
        state: '开启',
        des: undefined
      }
      this.dialogGameAreaList = {}
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
          createAreaVpn(this.temp).then(() => {
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
      updateAreaVpnState(row).then(() => {
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
          updateAreaVpn(tempData).then(() => {
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
