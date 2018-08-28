<template>
  <div class="app-container">
    
    <div class="filter-container">

      <el-select clearable class="filter-item" v-model="listQuery.category" placeholder="应用类型">
        <el-option v-for="item in categoryMap" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>

      <el-input  v-model="listQuery.name" style="width:100px;" placeholder="应用名称"></el-input>

      <el-select clearable class="filter-item" v-model="listQuery.creatorId" placeholder="开发者">
        <el-option v-for="item in developers" :key="item.memberId" :label="item.account" :value="item.memberId">
        </el-option>
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-add">添加dapp</el-button>
    </div>
  
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label='ID' width="95">
        <template slot-scope="scope">
          <span>{{scope.row.dappId}}</span>
        </template>
      </el-table-column>

      <el-table-column label="名称" width="110" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="类型" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.category | parseCategory}}
        </template>
      </el-table-column>
      <el-table-column label="图标" width="110" align="center">
        <template slot-scope="scope">
          <img v-bind:src="scope.row.icon" style="width: 50px;height: 50px" >
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

      <el-table-column align="center" prop="action" label="操作" width="400">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="2"><div class="grid-content bg-purple"></div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple-light"></div></el-col>
            <el-col :span="2"><div class="grid-content bg-purple"></div></el-col>
          </el-row>
          <span>
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)" style="float:left;">编辑</el-button>

            <el-upload style="float:left;margin-left:8px;"
              accept="image/jpeg,image/gif,image/png"
              :action="fileUploadUrl"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              name="files"
              :on-success="updateImageSuccess"
              multiple
              :limit="1"
              :on-exceed="handleExceed"
              :file-list="fileList">
              <el-button size="small" type="primary" @click="setSelectedDapp(scope.row)" >更换图标</el-button>
            </el-upload>

            <el-upload style="float:left; margin-left:8px;"
              accept="application/x-zip-compressed,application/zip"
              :action="fileUploadUrl"
              :before-upload="beforeDappUpload"
              name="files"
              :on-success="updateDappLinkSuccess"
              multiple
              :limit="1"
              >
              <el-button size="small" type="primary" @click="setSelectedDapp(scope.row)" >更换代码</el-button>
            </el-upload>
            
            <el-button v-if="scope.row.state =='0'" size="mini" @click="handleRegister(scope.row.dappId)">注册</el-button>
            <el-button v-if="scope.row.state =='1' || scope.row.state =='5'" size="mini" type="danger" @click="handleModifyState(scope.row.dappId,'2')">安装</el-button>
            <el-button v-if="scope.row.state =='2' || scope.row.state =='4' " size="mini" type="danger" @click="handleModifyState(scope.row.dappId,'3')">启动</el-button>
            <el-button v-if="scope.row.state =='3'" size="mini" type="danger" @click="handleModifyState(scope.row.dappId,'4')">停止</el-button>
            <el-button v-if="scope.row.state =='3' || scope.row.state =='2' || scope.row.state =='4'" size="mini" type="danger" @click="handleModifyState(scope.row.dappId,'5')">卸载</el-button>

          </span>
        </template>
      </el-table-column>
  
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="请输入注册应用的主密码和二级密码" :visible.sync="secretFormVisible">
      <el-form ref="secretForm" :model="tempSecret" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="主密码" prop="secret"> 
            <el-input  v-model="tempSecret.secret" required></el-input>
        </el-form-item>
        <el-form-item label="二级密码" prop="secondSecret"> 
            <el-input  v-model="tempSecret.secondSecret" required></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="secretFormVisible = false">取消</el-button>
        <el-button type="primary" @click="registerDapp">注册</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        
        <el-form-item label="名称" prop="name"> 
            <el-input  v-model="temp.name" required></el-input>
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select class="filter-item" v-model="temp.category" placeholder="Please select">
            <el-option v-for="item in categoryMap" :key="item.key" :label="item.label" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="temp.tags" ></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="temp.description"></el-input>
        </el-form-item>
        <el-form-item label="图标" v-if="dialogStatus=='create'" prop="icon">
          <el-upload
            class="upload-demo"
            accept="image/jpeg,image/gif,image/png"
            :action="fileUploadUrl"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :before-upload="beforeImageUpload"
            name="files"
            :on-success="uploadImageSuccess"
            multiple
            :limit="1"
            list-type="picture"
            :on-exceed="handleExceed"
            :file-list="fileList">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过100kb</div>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="dialogStatus=='create'" label="代码" prop="link">
          <el-upload
            class="upload-demo"
            accept="application/x-zip-compressed"
            :action="fileUploadUrl"
            :before-upload="beforeDappUpload"
            name="files"
            :on-success="uploadDappSuccess"
            multiple
            :limit="1"
            >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传zip文件，且不超过1M</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="代理人密码" prop="secrets">
          <el-input v-model="temp.secrets" type="textarea" rows="6"></el-input>
        </el-form-item>
        <el-form-item label="代理人公钥" prop="delegates">
          <el-input v-model="temp.delegates" type="textarea" rows="6"></el-input>
        </el-form-item>
        <el-form-item label="解锁要求" prop="unlockDelegates">
          <el-input v-model="temp.unlockDelegates" type="number" ></el-input>
        </el-form-item>
        <el-form-item label="所有者" prop="ownerId">
          <el-select clearable style="width: 200px" class="filter-item" v-model="temp.creatorId" placeholder="所有者">
            <el-option v-for="item in developers" :key="item.memberId" :label="item.account" :value="item.memberId">
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
import { fetchDappList, createDapp, updateDapp, updateDappState, registerDapp, fileUploadUrl } from '@/api/dapp'
import { parseTime } from '@/utils/index'

const categoryMap = [
  {
    key: 1,
    value: 'Common',
    label: '通用'
  },
  {
    key: 2,
    value: 'Business',
    label: '商业'
  },
  {
    key: 3,
    value: 'Social',
    label: '社交'
  },
  {
    key: 4,
    value: 'Education',
    label: '教育'
  },
  {
    key: 5,
    value: 'Entertainment',
    label: '娱乐'
  },
  {
    key: 6,
    value: 'News',
    label: '新闻'
  },
  {
    key: 7,
    value: 'Life',
    label: '生活'
  },
  {
    key: 8,
    value: 'Utilities',
    label: '工具'
  },
  {
    key: 9,
    value: 'Games',
    label: '游戏'
  }
]
export default {
  data() {
    return {
      list: null,
      developers: null,
      total: 0,
      listQuery: {
        name: '',
        category: null,
        creatorId: null,
        page: 1,
        limit: 10,
        sort: '-createTime'
      },
      temp: {
        dappId: undefined,
        name: '',
        tags: '',
        description: '',
        secrets: '',
        creatorId: '',
        icon: '',
        link: '',
        type: 0,
        unlockDelegates: 0
      },
      tempSecret: {
        dappId: undefined,
        secret: undefined,
        secondSecret: undefined
      },
      dialogFormVisible: false,
      secretFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑dapp',
        create: '添加dapp'
      },
      categoryMap,
      statusOptions: [{
        key: 0,
        value: '已创建'
      },
      {
        key: 1,
        value: '已注册'
      },
      {
        key: 2,
        value: '已安装'
      },
      {
        key: 3,
        value: '已启动'
      },
      {
        key: 4,
        value: '已关闭'
      },
      {
        key: 5,
        value: '已移除'
      }],
      // uploadActionUrl: 'http://118.24.135.98:9090/api/dapp/upload.do',
      // uploadActionUrl: 'http://116.211.100.207:9090/api/dapp/upload.do',
      // uploadActionUrl: '/api/dapp/upload.do',
      fileList: [],
      currentRow: null,
      listLoading: true
    }
  },
  computed: {
    fileUploadUrl: function() {
      return fileUploadUrl()
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '已创建',
        1: '已注册',
        2: '已安装',
        3: '已启动',
        4: '已停止',
        5: '已卸载'
      }
      return statusMap[status]
    },
    formatTime(mills) {
      return parseTime(mills)
    },
    parseCategory(catId) {
      for (var idx = 0; idx < categoryMap.length; idx++) {
        if (categoryMap[idx].key === catId) {
          return categoryMap[idx].label
        }
      }
      return ''
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleRemove(file, fileList) {
      // console.log(file, fileList)
    },
    handlePreview(file) {
      // console.log(file)
    },
    setSelectedDapp(row) {
      console.log('setDappId called: ', row)
      this.currentRow = row
    },
    beforeImageUpload(file) {
      const isIMAGE = file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'image/png'
      if (!isIMAGE) {
        console.log('filetype:', file.type)
        this.$message.error('上传文件只能是图片格式!')
        return false
      }
      if (file.size >= 100 * 1024) { // 只能不超过 100K
        this.$message.error('上传文件大小不能超过 100K!')
        return false
      }
      return true
    },
    uploadImageSuccess(response, file, fileList) {
      if (response.code === 20000) {
        this.temp.icon = response.data
        console.dir(this.temp)
      } else {
        this.$message.error('服务器保存ICON文件失败: ' + response.message)
      }
    },
    updateImageSuccess(response, file, fileList) {
      if (response.code === 20000) {
        // this.temp.icon = response.data
        updateDapp({ dappId: this.currentRow.dappId, icon: response.data }).then(() => {
          this.currentRow.icon = response.data
          for (const v of this.list) {
            if (v.dappId === this.currentRow.dappId) {
              // const index = this.list.indexOf(v)
              // this.list.splice(index, 1, this.currentRow)
              v.icon = response.data
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              // location.reload()
              break
            }
          }
        })
      } else {
        this.$message.error('服务器保存ICON文件失败: ' + response.message)
      }
    },
    updateDappLinkSuccess(response, file, fileList) {
      if (response.code === 20000) {
        // this.temp.icon = response.data
        updateDapp({ dappId: this.currentRow.dappId, link: response.data }).then(() => {
          this.currentRow.icon = response.data
          for (const v of this.list) {
            if (v.dappId === this.currentRow.dappId) {
              const index = this.list.indexOf(v)
              this.list.splice(index, 1, this.currentRow)
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              break
            }
          }
        })
      } else {
        this.$message.error('服务器保存ICON文件失败: ' + response.message)
      }
    },
    beforeDappUpload(file) {
      console.log('Before dapp upload')
      const isZip = file.type === 'application/x-zip-compressed' || file.type === 'application/zip'
      if (!isZip) {
        console.log('dapp filetype: ', file.type)
        this.$message.error('上传文件只能是zip格式!')
        return false
      }
      if (file.size >= 1024 * 1024) { // 只能不超过 1M
        this.$message.error('上传文件大小不能超过 1M!')
        return false
      }
      // var url = fileUploadUrl()
      // console.log(url)
      return true
      // console.dir(file)
      /*
      var DecompressZip = require('decompress-zip')
      var unzipper = new DecompressZip(file.raw)
      unzipper.on('error', function(err) {
        console.log('Caught an error')
        return false
      })

      unzipper.on('list', function(files) {
        console.log('The archive contains:');
        console.log(files)
      })

      unzipper.list()*/
    },
    uploadDappSuccess(response, file, fileList) {
      if (response.code === 20000) {
        this.temp.link = response.data
        console.dir(this.temp)
      } else {
        this.$message.error('服务器保存Dapp文件失败: ' + response.message)
      }
    },
    handleExceed(files, fileList) {
      // this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove(file, fileList) {
      // return this.$confirm(`确定移除 ${file.name} ?`)
    },
    onBeforeUploadIcon(file) {
      const isIMAGE = file.type === 'image/jpeg' || 'image/gif' || 'image/png'
      const isLt1M = file.size / 100 / 1024 < 1
      console.log('size: ', file.size, ', file.type: ', file.type)
      if (!isIMAGE) {
        this.$message.error('上传文件只能是图片格式!')
      }
      if (!isLt1M) {
        this.$message.error('上传文件大小不能超过 100KB!')
      }
      return isIMAGE && isLt1M
    },
    fetchData() {
      this.listLoading = true
      fetchDappList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.page.countTotal
        this.listLoading = false
      }).catch(function(err) {
        console.trace(err)
      })
      fetchMemberList({ userType: 1, limit: 10000 }).then(response => {
        this.developers = response.data.list
      }).catch(function(err) {
        console.trace(err)
      })
    },
    getList() {
      this.listLoading = true
      fetchDappList(this.listQuery).then(response => {
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
        dappId: undefined,
        name: '',
        state: 0,
        icon: '',
        link: '',
        secrets: 'flame bottom dragon rely endorse garage supply urge turtle team demand put,thrive veteran child enforce puzzle buzz valley crew genuine basket start top,black tool gift useless bring nothing huge vendor asset mix chimney weird,ribbon crumble loud chief turn maid neglect move day churn share fabric,scan prevent agent close human pair aerobic sad forest wave toe dust',
        delegates: 'db18d5799944030f76b6ce0879b1ca4b0c2c1cee51f53ce9b43f78259950c2fd,590e28d2964b0aa4d7c7b98faee4676d467606c6761f7f41f99c52bb4813b5e4,bfe511158d674c3a1e21111223a49770bee93611d998e88a5d2ea3145de2b68b,7bbf62931cf3c596591a580212631aff51d6bc0577c54769953caadb23f6ab00,452df9213aedb3b9fed6db3e2ea9f49d3db226e2dac01828bc3dcd73b7a953b4'
        // secrets: 'mom butter member circle feature law student join affair abandon slight roast,tuition opinion relax angle whisper female jelly bracket buddy clock fine hammer,brief fiscal monkey couch control hair spring before hire hope siren bacon,deny wife print subway wave typical anxiety rough deer borrow depart wrap,say improve almost virtual dynamic frog lend horn social fault sugar melody',
        // delegates: 'f84fea3b92930f44c1b5d8834da70e37f7819b17bd72367a8619811f87a653c6,24971c952fc718dca69ccbc18b44affa4595f39c3375e624cd2fdba35a7b9b62,0603a41639854643bb731b69160f246f5da59898ac9f1d9d974d487518650f20,f772d0035e49bc7bb684bfbc9fd7ad2a0654f67610af3a0cd849f38103769ecf,4bcb19cb40554d3f5639e7423a5e17f5564da17fb025ee38d40f610175ee12bb'
      }
    },
    resetTempSecret() {
      this.tempSecret = {
        dappId: undefined,
        secret: '',
        secondSecret: ''
      }
    },
    handleRegister(dappId) {
      // this.resetTempSecret()
      this.tempSecret = {
        dappId: dappId,
        secret: 'early sugar cannon mansion expose tunnel piece manual destroy exhaust helmet rather',
        secondSecret: ''
      }
      this.secretFormVisible = true
      this.$nextTick(() => {
        this.$refs['secretForm'].clearValidate()
      })
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
          createDapp(this.temp).then((res) => {
            this.temp.dappId = res.data
            this.temp.createTime = new Date().getTime()
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
    handleModifyState(dappId, state) {
      updateDappState({ dappId, state }).then(() => {
        for (const v of this.list) {
          if (v.dappId === dappId) {
            v.state = state
            // const index = this.list.indexOf(v)
            // this.list.splice(index, 1, row)
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
          updateDapp(tempData).then(() => {
            for (const v of this.list) {
              if (v.dappId === this.temp.dappId) {
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
    registerDapp() {
      this.$refs['secretForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.tempSecret)
          console.log(' ==== register ==== ', tempData)
          registerDapp(tempData).then(() => {
            for (const v of this.list) {
              if (v.dappId === this.temp.dappId) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.secretFormVisible = false
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
