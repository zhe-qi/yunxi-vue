import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'RadioGroup',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.SYS_NORMAL_DISABLE 便于维护
      options: getDictOptions('sys_normal_disable'),
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'Input',
    fieldName: 'remark',
    label: '备注',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '标签显示名',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '标签code',
  },
  {
    component: 'Input',
    fieldName: 'module',
    label: '模块标志',
  },
  {
    component: 'Input',
    fieldName: 'createBy',
    label: '创建者',
  },
  {
    component: 'RangePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'createTime',
    label: '创建时间',
  },
  {
    component: 'Input',
    fieldName: 'updateBy',
    label: '更新者',
  },
  {
    component: 'RangePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'updateTime',
    label: '更新时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    title: '状态',
    field: 'status',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.SYS_NORMAL_DISABLE 便于维护
        return renderDict(row.status, 'sys_normal_disable');
      },
    },
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    title: '标签显示名',
    field: 'name',
  },
  {
    title: '标签code',
    field: 'code',
  },
  {
    title: '模块标志',
    field: 'module',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    label: '状态',
    fieldName: 'status',
    component: 'RadioGroup',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.SYS_NORMAL_DISABLE 便于维护
      options: getDictOptions('sys_normal_disable'),
      buttonStyle: 'solid',
      optionType: 'button',
    },
  },
  {
    label: '备注',
    fieldName: 'remark',
    component: 'Input',
  },
  {
    label: '标签显示名',
    fieldName: 'name',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '标签code',
    fieldName: 'code',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '标签ID',
    fieldName: 'id',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    label: '模块标志',
    fieldName: 'module',
    component: 'Input',
    rules: 'required',
  },
];

export const drawerSchema = modalSchema;