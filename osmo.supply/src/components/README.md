# 可复用交互组件

## MotionButton

普通文字按钮和按钮式链接的默认入口。根节点直接输出原生 `button` 或 `a`，不增加布局容器；业务 class、ARIA、键盘事件和插槽图标保留在原有层级。

根节点声明 `has-button-roll`，不会因外部 `active` 等动态 class 更新而丢失动效裁切。不要改回仅在挂载时手动添加 class 的方式。

```vue
<MotionButton label="Discover" class="text-button" href="/product">
  <ArrowDownRight :size="18" />
</MotionButton>
<MotionButton label="Save" type="submit" :disabled="saving" />
<MotionButton label="Become a member" :href="planUrl" full />
```

- `href` 决定链接语义；省略时默认 `type="button"`，表单提交需显式传 `type="submit"`。
- `label` 是可访问名称的文字内容；动画副本带 `aria-hidden`。
- `full` 使用全宽 CTA 的旋转半径和时长，不负责设置布局宽度。
- `inherit-size` 保留标签、开关等现有文字尺寸。
- `disabled` 阻止操作和动效；禁用链接保留地址但移出 Tab 顺序、阻止导航。
- `click` 透传原生事件。`target`、`rel`、`aria-*`、`data-*`、样式和其余原生事件落到根节点。

## ButtonLabel

负责文字旋转、快速重复悬停保护、键盘聚焦、减少动态效果偏好及动画清理。需要保留复杂原生 DOM 的菜单开关、带多段文字的作者按钮等可以直接使用它，不必为了统一 API 改动原结构。

通用动效样式随组件加载；特定宿主的定位和裁切例外继续由页面样式负责。不要用它替换拖拽命中区域或轮播的上下方向光标。

## BillingSwitch

```vue
<BillingSwitch v-model="billing" />
```

仅管理 `quarterly` / `annual` 选择及外观，不计算价格、不拼接订阅地址。季度按钮始终方角、年度按钮始终圆角，选中状态只改变颜色。支持点击、Tab + Enter/Space、左右方向键和 Home/End；重复选择不重复提交变更。

价格和跳转地址保持由父页面派生，确保显示与实际购买周期共享同一状态。计费开关样式全部在组件内，不再叠加页面历史覆盖规则。

## 保持封装边界

复杂轮播、弹窗和滚动联动暂不泛化。新增复用需求优先组合现有组件；迁移时保持根节点、事件、焦点、ARIA 和原生表单语义，并补充组件测试及浏览器检查。
