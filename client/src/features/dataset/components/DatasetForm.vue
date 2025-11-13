<template>
  <v-card outlined class="pa-6 mb-4">
    <v-card-title class="text-h6 font-weight-medium">
      {{ isEdit ? "Dataset Details" : "Create New Dataset" }}
    </v-card-title>
    <v-card-text>
      <v-form ref="formRef" v-model="valid" lazy-validation>
        <!-- Dataset Name -->
        <v-text-field
          v-model="localDataset.name"
          label="Name *"
          variant="outlined"
          dense
          :rules="[v => !!v || 'Dataset Name is required']"
          required
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
          :rules="[v => !!v || 'Application Package is required']"
          required
        />
        <!-- Storage Type -->
        <v-select
          v-model="localDataset.storageType"
          :items="storageOptions"
          label="Select Storage Type"
          variant="outlined"
          dense
        />
        <!-- Enable V3 Radio Group -->
        <div class="mt-4">
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Enable V3?
          </label>
          <v-radio-group v-model="localDataset.enablev3" inline>
            <v-radio label="Yes" :value="true" color="primary"></v-radio>
            <v-radio label="No" :value="false" color="primary"></v-radio>
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
    </v-card-text>
  </v-card>
</template>
<script setup>
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
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
    }),
  },
  isEdit: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "submit"]);
const formRef = ref(null);
const valid = ref(false);
// Mock dropdown data (can be replaced by API)
const applicationPackages = [
  "Finance Analytics",
  "Transportation Insights",
  "Health Records",
  "Retail Data Engine",
];
const storageOptions = ["Blob", "SFTP"];
// Local deep clone to avoid mutating props directly
const localDataset = reactive(JSON.parse(JSON.stringify(props.modelValue)));
// Watch for parent updates → update local form
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(localDataset)) {
      Object.assign(localDataset, newVal);
    }
  },
  { deep: true, immediate: true }
);
// Emit changes → keep parent model in sync
watch(
  localDataset,
  (newVal) => {
    emit("update:modelValue", JSON.parse(JSON.stringify(newVal)));
  },
  { deep: true }
);

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
  gap: 16px;
}
.v-card {
  border-radius: 12px;
  background-color: #ffffff !important;
}
</style>