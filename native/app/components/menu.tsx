import * as DropdownMenu from "zeego/dropdown-menu";
import { View } from "react-native";
import { useState } from "react";
import MenuIcon from "../../images/svg/ellipses-horizontal.svg";

type ItemSort = "power" | "type" | "typeAndPower";

export function MyMenu() {
  const [sort, setSort] = useState<ItemSort>("power");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <MenuIcon style={{ marginRight: 16 }} width="30" height="30" />
      </DropdownMenu.Trigger>
      {/* @ts-ignore */}
      <DropdownMenu.Content style={{ backgroundColor: "green" }}>
        <DropdownMenu.Label>Sort options:</DropdownMenu.Label>
        <DropdownMenu.CheckboxItem key="power" onValueChange={() => setSort("power")} value={sort === "power"}>
          <DropdownMenu.ItemTitle>Power</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIndicator>
            <View style={{ width: 20, height: 20, backgroundColor: "white" }} />
          </DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key="type"
          onValueChange={() => {
            setSort("type");
          }}
          value={sort === "type"}
        >
          <DropdownMenu.ItemTitle>Type</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIndicator>
            <View style={{ width: 20, height: 20, backgroundColor: "white" }} />
          </DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key="typeAndPower"
          onValueChange={() => {
            setSort("typeAndPower");
          }}
          value={sort === "typeAndPower"}
        >
          <DropdownMenu.ItemTitle>Type and Power</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIndicator>
            <View style={{ width: 20, height: 20, backgroundColor: "white" }} />
          </DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
