<script setup lang="ts">
import type { DeptTree } from '#/api/system/user/model';

import { onMounted, type PropType, ref } from 'vue';

import { SyncOutlined } from '@ant-design/icons-vue';
import { Empty, InputSearch, Skeleton, Tree } from 'ant-design-vue';

import { getDeptTree } from '#/api/system/user';

defineOptions({ inheritAttrs: false });

const emit = defineEmits<{ select: [] }>();

const selectDeptId = defineModel('selectDeptId', {
  required: true,
  type: Array as PropType<string[]>,
});

const searchValue = defineModel('searchValue', {
  type: String,
  default: '',
});

/** 部门数据源 */
type DeptTreeArray = DeptTree[];
const deptTreeArray = ref<DeptTreeArray>([]);
/** 骨架屏加载 */
const showTreeSkeleton = ref<boolean>(true);

async function reload() {
  showTreeSkeleton.value = true;
  searchValue.value = '';
  selectDeptId.value = [];

  const ret = await getDeptTree();
  emit('select');

  deptTreeArray.value = ret;
  showTreeSkeleton.value = false;
}

onMounted(reload);
</script>

<template>
  <div :class="$attrs.class">
    <Skeleton
      :loading="showTreeSkeleton"
      :paragraph="{ rows: 8 }"
      active
      class="p-[8px]"
    >
      <div
        class="bg-background flex h-full flex-col overflow-y-auto rounded-lg"
      >
        <!-- 固定在顶部 必须加上bg-background背景色 否则会产生'穿透'效果 -->
        <div class="bg-background z-100 sticky left-0 top-0 p-[8px]">
          <InputSearch
            v-model:value="searchValue"
            placeholder="Search"
            size="small"
          >
            <template #enterButton>
              <a-button @click="reload">
                <SyncOutlined class="text-primary" />
              </a-button>
            </template>
          </InputSearch>
        </div>
        <div class="h-full overflow-x-hidden px-[8px]">
          <Tree
            v-bind="$attrs"
            v-if="deptTreeArray.length > 0"
            v-model:selected-keys="selectDeptId"
            :class="$attrs.class"
            :field-names="{ title: 'label', key: 'id' }"
            :show-line="{ showLeafIcon: false }"
            :tree-data="deptTreeArray"
            :virtual="false"
            default-expand-all
            @select="$emit('select')"
          >
            <template #title="{ label }">
              <span v-if="label.indexOf(searchValue) > -1">
                {{ label.substring(0, label.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{
                  label.substring(
                    label.indexOf(searchValue) + searchValue.length,
                  )
                }}
              </span>
              <span v-else>{{ label }}</span>
            </template>
          </Tree>
          <!-- 仅本人数据权限 可以考虑直接不显示 -->
          <div v-else class="mt-5">
            <Empty
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="无部门数据"
            />
          </div>
        </div>
      </div>
    </Skeleton>
  </div>
</template>
