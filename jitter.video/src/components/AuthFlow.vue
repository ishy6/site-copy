<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, Check, ChevronRight, X, PenTool, Megaphone, BriefcaseBusiness, GraduationCap, Code2, Sparkles, Play, Layers, Rocket, Mail } from 'lucide-vue-next'
import { isEmail, profile, saveProfile, verifyDemoEmail } from '../state'

const props = defineProps<{ route: string }>()
const emit = defineEmits<{ navigate: [path: string] }>()
const authStep = ref<'choice' | 'email' | 'code'>('choice')
const email = ref('')
const code = ref('')
const error = ref('')
const resent = ref(false)
const googleDialog = ref<HTMLDialogElement>()
const emailInput = ref<HTMLInputElement>()
const codeInput = ref<HTMLInputElement>()
const heading = ref<HTMLElement>()
const step = ref(profile.step)
const name = ref(profile.name)
const role = ref(profile.role)
const experience = ref(profile.experience)
const workspace = ref(profile.workspace)
const roles = [
  { name: 'Designer', icon: PenTool }, { name: 'Marketer', icon: Megaphone },
  { name: 'Founder', icon: BriefcaseBusiness }, { name: 'Student', icon: GraduationCap },
  { name: 'Developer', icon: Code2 }, { name: 'Something else', icon: Sparkles },
]
const experiences = [
  { name: 'Just getting started', description: 'A little curious. Ready to explore.', icon: Sparkles },
  { name: 'I know a little', description: 'I’ve made a few things move before.', icon: Play },
  { name: 'I do this all the time', description: 'Motion is already part of my workflow.', icon: Layers },
]
const validStep = computed(() => [Boolean(name.value.trim()), Boolean(role.value), Boolean(experience.value), Boolean(workspace.value.trim())][step.value])
const progressLabels = ['About you', 'Your role', 'Your experience', 'Your workspace']

watch(() => props.route, () => { error.value = ''; authStep.value = 'choice' })
watch([name, role, experience, workspace, step], () => {
  if (!profile.active) return
  Object.assign(profile, { name: name.value, role: role.value, experience: experience.value, workspace: workspace.value, step: step.value })
  saveProfile()
})

async function showEmail() { authStep.value = 'email'; error.value = ''; await nextTick(); emailInput.value?.focus() }
async function submitEmail() {
  if (!isEmail(email.value)) { error.value = 'Please enter a valid email address.'; return }
  email.value = email.value.trim().toLowerCase()
  error.value = ''
  authStep.value = 'code'
  await nextTick()
  codeInput.value?.focus()
}
function verifyCode() {
  if (code.value.trim() !== '123456') { error.value = 'That code doesn’t match. Use the demo code 123456.'; return }
  verifyDemoEmail(email.value)
  step.value = profile.step
  name.value = profile.name
  role.value = profile.role
  experience.value = profile.experience
  workspace.value = profile.workspace
  emit('navigate', profile.complete ? '/files' : '/onboarding')
}
function googleDemo() {
  googleDialog.value?.close()
  verifyDemoEmail('creative@example.com')
  name.value = profile.name || 'Alex'
  role.value = profile.role
  experience.value = profile.experience
  workspace.value = profile.workspace
  step.value = profile.step
  profile.name = name.value
  saveProfile()
  emit('navigate', profile.complete ? '/files' : '/onboarding')
}
async function nextStep() {
  if (!validStep.value) { error.value = 'Choose an option or fill in the field to continue.'; return }
  error.value = ''
  if (step.value < 3) {
    step.value++
    if (step.value === 3 && !workspace.value) workspace.value = `${name.value.trim()}’s workspace`
    await nextTick()
    heading.value?.focus()
  } else {
    Object.assign(profile, { name: name.value.trim(), role: role.value, experience: experience.value, workspace: workspace.value.trim(), complete: true, step: 3 })
    saveProfile()
    emit('navigate', '/files')
  }
}
function previousStep() { error.value = ''; step.value > 0 ? step.value-- : emit('navigate', '/join') }
onBeforeUnmount(() => googleDialog.value?.close())
</script>

<template>
  <main v-if="route !== '/onboarding'" id="main-content" class="auth-page" tabindex="-1">
    <a class="auth-back" href="/" @click.prevent="emit('navigate', '/')"><ArrowLeft :size="16" /> Back to Jitter</a>
    <section class="auth-card">
      <a href="/" class="auth-logo" aria-label="Jitter homepage" @click.prevent="emit('navigate', '/')"><img src="/assets/jitter.svg" alt="Jitter" width="88" /></a>
      <template v-if="authStep !== 'code'">
        <h1>We’ll sign you in, or create an account<br />if you don’t have one yet.</h1>
        <div class="auth-buttons"><button class="google-button" @click="googleDialog?.showModal()"><svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.91a6 6 0 0 1 0-3.82v-2.6H3.04a10 10 0 0 0 0 9.02l3.35-2.6Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6A6 6 0 0 1 12 5.96Z"/></svg>Continue with Google</button><button v-if="authStep === 'choice'" class="email-button" @click="showEmail">Continue with email</button><form v-else class="email-form" novalidate @submit.prevent="submitEmail"><label class="sr-only" for="auth-email">Your email address</label><input id="auth-email" ref="emailInput" v-model="email" type="email" autocomplete="email" placeholder="Enter your email" :aria-invalid="Boolean(error)" aria-describedby="auth-error" @input="error = ''" /><button class="email-button" type="submit">Continue with email <ArrowRight :size="17" /></button></form></div>
        <p v-if="error" id="auth-error" class="field-error" role="alert">{{ error }}</p>
        <p class="auth-terms">By clicking “Continue”, you agree to the<br /><a href="https://jitter.video/terms/" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="https://jitter.video/privacy/" target="_blank" rel="noreferrer">Privacy policy</a>.</p>
      </template>
      <template v-else>
        <div class="mail-symbol"><Mail :size="28" /></div><h1 class="verify-title">Check your inbox</h1><p class="verify-description">Continue with the code for<br /><strong>{{ email }}</strong></p>
        <div class="demo-code"><span>LOCAL DEMO · NO EMAIL SENT</span><p>Your demo code is <b>123456</b></p></div>
        <form class="code-form" novalidate @submit.prevent="verifyCode"><label for="verification-code">Verification code</label><input id="verification-code" ref="codeInput" v-model="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" :aria-invalid="Boolean(error)" aria-describedby="code-error" @input="error = ''" /><p v-if="error" id="code-error" class="field-error" role="alert">{{ error }}</p><button class="email-button">Verify & continue <ArrowRight :size="18" /></button></form>
        <div class="resend-row"><button @click="resent = true">Show code again</button><span>·</span><button @click="showEmail(); code = ''">Use a different email</button></div><small v-if="resent" role="status">Your local demo code is still 123456. No email is sent.</small>
      </template>
    </section>
    <p class="demo-disclosure"><span></span> Unofficial local demo · No real account is created</p>
  </main>

  <main v-else id="main-content" class="onboarding-page" tabindex="-1">
    <section class="onboarding-main"><div class="onboarding-top"><a href="/" aria-label="Jitter homepage" @click.prevent="emit('navigate', '/')"><img src="/assets/jitter.svg" alt="Jitter" width="82" /></a><span>Let’s get you moving</span></div>
      <div class="onboarding-form"><div class="onboarding-progress" :aria-label="`Step ${step + 1} of 4: ${progressLabels[step]}`"><span v-for="index in 4" :key="index" :class="{ complete: index <= step, current: index === step + 1 }"></span></div><span class="eyebrow">{{ progressLabels[step] }} <span class="step-count">{{ step + 1 }} / 4</span></span>
        <form @submit.prevent="nextStep">
          <template v-if="step === 0"><h1 ref="heading" tabindex="-1">First things first.<br />What’s your name?</h1><p>We’re glad you’re here. Let’s make this space yours.</p><label class="input-label" for="full-name">Your name</label><input id="full-name" v-model="name" class="setup-input" autocomplete="name" placeholder="e.g. Alex Morgan" maxlength="60" required autofocus /><small class="input-hint">What should we call you?</small></template>
          <template v-else-if="step === 1"><h1 ref="heading" tabindex="-1">What brings you<br />to Jitter, {{ name.split(' ')[0] }}?</h1><p>Tell us a little about what you do.</p><div class="role-options" role="group" aria-label="Your role"><button v-for="option in roles" :key="option.name" type="button" :class="['role-option', { selected: role === option.name }]" :aria-pressed="role === option.name" @click="role = option.name"><component :is="option.icon" :size="23" stroke-width="1.5" /><span>{{ option.name }}</span><Check v-if="role === option.name" class="option-check" :size="16" /></button></div></template>
          <template v-else-if="step === 2"><h1 ref="heading" tabindex="-1">A first move,<br />or your next move?</h1><p>How familiar are you with motion design?</p><div class="experience-options" role="group" aria-label="Motion design experience"><button v-for="option in experiences" :key="option.name" type="button" :class="['experience-option', { selected: experience === option.name }]" :aria-pressed="experience === option.name" @click="experience = option.name"><component :is="option.icon" :size="24" stroke-width="1.5" /><span><b>{{ option.name }}</b><small>{{ option.description }}</small></span><span class="radio-indicator"><Check v-if="experience === option.name" :size="13" /></span></button></div></template>
          <template v-else><h1 ref="heading" tabindex="-1">A home for your<br />next great idea.</h1><p>Name your workspace. You can always change it later.</p><label class="input-label" for="workspace-name">Workspace name</label><input id="workspace-name" v-model="workspace" class="setup-input" placeholder="e.g. Studio North" maxlength="70" required /><div class="workspace-summary"><span class="workspace-initial">{{ (workspace.trim() || name).charAt(0).toUpperCase() }}</span><div><b>{{ workspace || 'Your workspace' }}</b><small>Free plan · Just you, for now</small></div><span class="free-badge">Free</span></div><p class="workspace-hint"><Check :size="15" /> No credit card. No pressure. Just possibilities.</p></template>
          <p v-if="error" class="field-error" role="alert">{{ error }}</p><button class="button dark setup-continue" type="submit" :disabled="!validStep">{{ step === 3 ? 'Let’s create something' : 'Continue' }}<Rocket v-if="step === 3" :size="18" /><ArrowRight v-else :size="19" /></button><button class="setup-back" type="button" @click="previousStep"><ArrowLeft :size="15" /> Back</button>
        </form>
      </div><div class="onboarding-bottom"><span>Local demo · Progress saved in this browser</span><a href="https://help.jitter.video/" target="_blank" rel="noreferrer">Need a hand? <ChevronRight :size="13" /></a></div>
    </section>
    <aside class="onboarding-art"><div class="art-topline"><span>A little spark. A lot of possibility.</span><Sparkles :size="19" /></div><div class="onboarding-poster" :class="`poster-step-${step}`"><span class="poster-eyebrow">{{ ['THIS IS YOUR SIGN', 'YOUR IDEAS. YOUR RULES.', 'EVERY EXPERT WAS A BEGINNER', 'GREAT THINGS START HERE'][step] }}</span><h2>{{ ['Make\nyour\nmove.', 'Make\nit your\nown.', 'Start\nsome-\nthing.', 'Good\nthings\nahead.'][step] }}</h2><span class="poster-star">✳</span><div class="poster-bottom"><span>Jitter</span><ArrowRight :size="27" /></div></div><div class="art-caption"><span class="art-caption-line"></span><p>Big ideas start with a little motion.<br /><b>You’ve got this. We’ve got you.</b></p></div><div class="art-bottomline"><span>Made for the way you create.</span><span>01 — 04</span></div></aside>
  </main>

  <dialog ref="googleDialog" aria-label="Demo account" class="google-dialog" @click="($event.target === googleDialog) && googleDialog?.close()"><button class="icon-button modal-close" aria-label="Close demo account dialog" @click="googleDialog?.close()"><X :size="20" /></button><Sparkles :size="32" /><h2>Try it with a demo account.</h2><p>Google sign-in isn’t connected in this replica. Continue as <b>creative@example.com</b> to explore the full onboarding flow. No Google credentials are requested.</p><button class="button purple" @click="googleDemo">Continue with demo account <ArrowRight :size="18" /></button><button class="text-link" @click="googleDialog?.close(); showEmail()">Use an email instead</button></dialog>
</template>
