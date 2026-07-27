import { demoCollections, demoComponents } from "@/services/demo-data";

export async function getComponents() {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return demoComponents;
}

export async function getCollections() {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return demoCollections;
}

export async function getComponentById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return demoComponents.find((component) => component.id === id) ?? demoComponents[0];
}
