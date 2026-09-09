<script setup lang="ts">
import { computed, ref } from 'vue';
import { money, type CartLine, type Product } from '../reference';
const props = defineProps<{ cart: CartLine[]; products: Record<string, Product> }>();
const email = ref('');
const coupon = ref('');
const message = ref('');
const couponMessage = ref('');
const total = computed(() => props.cart.reduce((sum, line) => sum + props.products[line.url].variantData.find(v => v.id === line.variantId)!.salePrice * line.quantity, 0));
function submitEmail() { message.value = 'Your email is valid. Continue at makr.com to arrange delivery and payment.'; }
</script>

<template>
  <div class="checkout-step checkout-step-email">
    <div v-if="cart.length" class="checkout-blocks">
      <div class="checkout-content checkout-email">
        <div class="applepay"></div>
        <h1>What email should we send order info to?</h1>
        <form class="update-cart-form" @submit.prevent.stop="submitEmail">
          <div class="checkout-label-field-pair"><input id="email" v-model="email" type="email" name="email" class="makr-input" placeholder="your@email.com" aria-label="Order email" required /></div>
          <div><button type="submit" class="checkout-button">Next</button></div>
          <p v-if="message" class="local-form-feedback" role="status">{{ message }} <a href="https://makr.com/" target="_blank" rel="noopener">Continue to MAKR</a></p>
        </form>
      </div>
      <div class="checkout-summary">
        <div class="order-review">
          <div class="order-review-overlay"></div>
          <div class="header summary-block"><h3>Order Review</h3></div>
          <div class="order-items summary-block">
            <div v-for="line in cart" :key="line.variantId" class="item-rows"><div class="item">
              <div class="thumbnail"><div class="product-image"><picture><img v-if="products[line.url].productImages.length" :src="products[line.url].productImages[0].url" :alt="products[line.url].titleOne" /></picture></div></div>
              <div class="description"><div class="segment-one">{{ products[line.url].titleOne }}</div><div class="segment-two">{{ products[line.url].titleTwo }}</div><div class="finish">{{ products[line.url].finish }}</div></div>
              <div class="qty">{{ line.quantity }}</div><div class="subtotal">${{ (products[line.url].variantData.find(v => v.id === line.variantId)!.salePrice * line.quantity).toFixed(2) }}</div>
            </div></div>
          </div>
          <div class="apply-coupon summary-block"><div class="section-title">apply a coupon</div><form @submit.prevent.stop="couponMessage = 'Coupon validation is available at makr.com.'"><div class="coupon-row"><input v-model="coupon" type="text" name="couponCode" placeholder="Coupon Code" aria-label="Coupon Code" required /><button type="submit">Update Cart</button></div><p v-if="couponMessage" class="local-form-feedback" role="status">{{ couponMessage }}</p></form></div>
          <div class="order-shipping summary-block"><div class="shipping-row"><div class="shipping-label">Subtotal</div><div class="shipping-cost">${{ total.toFixed(2) }}</div></div><div class="shipping-row"><div class="shipping-label">Tax</div><div class="shipping-cost">$0.00</div></div><div class="shipping-row"><div class="shipping-label last">Total</div><div class="shipping-cost last">${{ total.toFixed(2) }}</div></div></div>
        </div>
      </div>
    </div>
    <div v-else class="checkout-blocks"><div class="checkout-content checkout-cart-empty"><h1>Your cart is empty</h1></div></div>
  </div>
</template>
