<template>
    <v-dialog v-model="dialogProxy" max-width="500">
      <v-card>
        <v-card-title class="text-h6 font-weight-medium">Add Dataset</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Dataset Name" outlined dense />
          <v-select
            v-model="form.type"
            :items="['CSV', 'Excel', 'JSON', 'XML']"
            label="Type"
            outlined
            dense
          />
          <v-select
            v-model="form.source"
            :items="['Internal', 'External', 'API', 'Manual Upload']"
            label="Source"
            outlined
            dense
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveDataset">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  <script setup>
  import { defineEmits, defineProps, reactive, computed } from "vue";
  // Props + Emits
  const props = defineProps({ modelValue: Boolean });
  const emit = defineEmits(["update:modelValue", "save"]);
  // Local computed proxy for v-model
  const dialogProxy = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
  });
  // Form data
  const form = reactive({
    name: "",
    type: "",
    source: "",
  });
  // Methods
  function closeDialog() {
    emit("update:modelValue", false);
  }
  function saveDataset() {
    if (!form.name || !form.type) return;
    emit("save", { ...form, createdAt: new Date().toISOString() });
    closeDialog();
  }
  </script>