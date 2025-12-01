<template>
  <v-container class="pa-6 mb-4 form-box" fluid>

    <v-form ref="formRef" v-model="valid" lazy-validation>
      <!-- Dataset Name -->
      <v-text-field
        v-model="localDataset.name"
        label="Name *"
        variant="outlined"
        dense
        :rules="[(v) => !!v || 'Dataset Name is required']"
        required
        :disabled="isEdit"
      />

      <!-- Description -->
      <v-textarea
        v-model="localDataset.description"
        label="Description"
        variant="outlined"
        dense
        rows="3"
      />

      <!-- Application Package -->
      <v-select
        v-model="localDataset.applicationPackageId"
        :items="applicationPackages"
        label="Select Application Package *"
        variant="outlined"
        dense
        clear-icon=""
        :rules="[(v) => !!v || 'Application Package is required']"
        required
      >
        <template #append-inner>
          <span class="material-symbols-outlined">keyboard_arrow_down</span>
        </template>
      </v-select>

      <!-- Storage Type -->
      <v-select
        v-model="localDataset.storageType"
        :items="storageOptions"
        label="Select Storage Type"
        variant="outlined"
        dense
        :disabled="isEdit"
        required
      >
        <template #append-inner>
          <span class="material-symbols-outlined">keyboard_arrow_down</span>
        </template>
      </v-select>

      <v-select
        v-if="localDataset.storageType === 'Blob'"
        v-model="localDataset.endpointServerUUID"
        :items="endpointServers"
        label="Select Endpoint Server *"
        item-title="label"
        item-value="value"
        variant="outlined"
        dense
        :rules="[
          (v) => !!v || 'Endpoint Server is required for Blob storage',
        ]"
        required
        :disabled="isEdit"
      >
        <template #append-inner>
          <span class="material-symbols-outlined">keyboard_arrow_down</span>
        </template>
      </v-select>

      <!-- Enable V3 Radio Group -->
      <div>
        <label class="text-subtitle-2 font-weight-medium d-block">
          Enable V3?
        </label>

        <v-radio-group v-model="localDataset.enablev3">
          <!-- YES -->
          <v-radio :value="true">
            <template #label>
              <span class="material-symbols-outlined mr-1">
                {{
                  localDataset.enablev3 === true
                    ? "radio_button_checked"
                    : "radio_button_unchecked"
                }}
              </span>
              Yes
            </template>
          </v-radio>

          <!-- NO -->
          <v-radio :value="false">
            <template #label>
              <span class="material-symbols-outlined mr-1">
                {{
                  localDataset.enablev3 === false
                    ? "radio_button_checked"
                    : "radio_button_unchecked"
                }}
              </span>
              No
            </template>
          </v-radio>
        </v-radio-group>
      </div>

      <!-- Table Prefix -->
      <v-text-field
        v-model="localDataset.tablePrefix"
        label="Table Prefix"
        variant="outlined"
        dense
      />
    </v-form>
  </v-container>
</template>

<script setup>
import { reactive, ref, watch, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: "",
      description: "",
      applicationPackageId: "",
      storageType: "",
      enablev3: false,
      tablePrefix: "",
      endpointServerUUID: "",
    }),
  },
  isEdit: { type: Boolean, default: false },
  endpoints: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "valid"]);

const formRef = ref(null);
const valid = ref(false);

// Mock dropdown data 
const applicationPackages = [
  "Finance Analytics",
  "Transportation Insights",
  "Health Records",
  "Retail Data Engine",
];
const storageOptions = ["Blob", "SFTP"];

const endpointServers = computed(() =>
  props.endpoints.map((ep) => ({
    label: ep.name,
    value: ep.uuid,
  }))
);

// Local deep clone to avoid mutating props directly
const localDataset = reactive(JSON.parse(JSON.stringify(props.modelValue)));

// Watch for parent updates - update local form
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(localDataset)) {
      Object.assign(localDataset, newVal);
    }
  },
  { deep: true, immediate: true }
);

// Emit changes - keep parent model in sync
watch(
  localDataset,
  (newVal) => {
    emit("update:modelValue", JSON.parse(JSON.stringify(newVal)));
  },
  { deep: true }
);

// whenever v-form validity changes, notify parent
watch(valid, (newVal) => {
  emit("valid", newVal);
});
</script>


<style scoped>
.v-btn {
  text-transform: none;
  font-weight: 500;
}

label {
  color: #374151;
}

.v-text-field,
.v-textarea,
.v-select {
  margin-bottom: 16px;
}

.v-radio-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-box {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0;         
}

/* Hide default Vuetify field icons so only Google icons show */
:deep(.v-field__append-inner .v-icon),
:deep(.v-field__clearable .v-icon) {
  display: none !important;
}

/* Radio: hide Vuetify's default circle */
:deep(.v-selection-control__input) {
  display: none !important;
}

:deep(.v-radio .v-selection-control__wrapper) {
  width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}
</style>

