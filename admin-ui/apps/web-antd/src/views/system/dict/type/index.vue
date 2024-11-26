<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import {
  Dropdown,
  Menu,
  MenuItem,
  type MenuProps,
  Modal,
  Popconfirm,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  tableCheckboxEvent,
  useVbenVxeGrid,
  type VxeGridProps,
} from '#/adapter/vxe-table';
import {
  dictTypeExport,
  dictTypeList,
  dictTypeRemove,
  refreshDictTypeCache,
} from '#/api/system/dict/dict-type';
import { dictSyncTenant } from '#/api/system/tenant';
import { useTenantStore } from '#/store/tenant';
import { commonDownloadExcel } from '#/utils/file/download';

import { emitter } from '../mitt';
import { columns, querySchema } from './data';
import dictTypeModal from './dict-type-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 70,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    // trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        // 区间选择器处理
        if (formValues?.createTime) {
          formValues.params = {
            beginTime: dayjs(formValues.createTime[0]).format(
              'YYYY-MM-DD 00:00:00',
            ),
            endTime: dayjs(formValues.createTime[1]).format(
              'YYYY-MM-DD 23:59:59',
            ),
          };
          Reflect.deleteProperty(formValues, 'createTime');
        } else {
          Reflect.deleteProperty(formValues, 'params');
        }

        return await dictTypeList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'dictId',
  },
  id: 'system-dict-type-index',
};

const checked = ref(false);
const lastDictType = ref('');

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    cellClick: (e: any) => {
      const { row } = e;
      if (lastDictType.value === row.dictType) {
        return;
      }
      emitter.emit('rowClick', row.dictType);
      lastDictType.value = row.dictType;
    },
    checkboxChange: tableCheckboxEvent(checked),
    checkboxAll: tableCheckboxEvent(checked),
  },
});
const [DictTypeModal, modalApi] = useVbenModal({
  connectedComponent: dictTypeModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(record: Recordable<any>) {
  modalApi.setData({ id: record.dictId });
  modalApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await dictTypeRemove(row.dictId);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.dictId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await dictTypeRemove(ids);
      await tableApi.query();
      checked.value = false;
    },
  });
}

const handleMenuClick: MenuProps['onClick'] = (e) => {
  switch (e.key) {
    case '1': {
      handleRefreshCache();
      break;
    }
    case '2': {
      handleSyncTenantDict();
      break;
    }
  }
};
async function handleRefreshCache() {
  await refreshDictTypeCache();
  await tableApi.query();
}

function handleSyncTenantDict() {
  Modal.confirm({
    title: '提示',
    iconType: 'warning',
    content: '确认同步租户字典？',
    onOk: async () => {
      await dictSyncTenant();
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  commonDownloadExcel(
    dictTypeExport,
    '字典类型数据',
    tableApi.formApi.form.values,
  );
}

const { hasAccessByRoles } = useAccess();
const tenantStore = useTenantStore();
/**
 * 开启租户 & 超级管理员才可以同步租户字典
 */
const couldSyncTenantDict = computed(() => {
  return tenantStore.tenantEnable && hasAccessByRoles(['superadmin']);
});
</script>

<template>
  <div>
    <BasicTable id="dict-type" table-title="字典类型列表">
      <template #toolbar-tools>
        <Space>
          <Dropdown>
            <template #overlay>
              <Menu @click="handleMenuClick">
                <span v-access:code="['system:dict:edit']">
                  <MenuItem key="1">刷新字典缓存</MenuItem>
                </span>
                <span v-if="couldSyncTenantDict">
                  <MenuItem key="2"> 同步租户字典 </MenuItem>
                </span>
              </Menu>
            </template>
            <a-button> 更多 </a-button>
          </Dropdown>
          <a-button
            v-access:code="['system:dict:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['system:dict:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:dict:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['system:dict:edit']"
            @click.stop="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="
              (node) => getVxePopupContainer(node, 'dict-type')
            "
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['system:dict:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <DictTypeModal @reload="tableApi.query()" />
  </div>
</template>
