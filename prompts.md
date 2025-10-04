```
Build a simple Javascript web application.  Use NextJS and the Park UI framework.  All data should be processed client-side.  The main interface is a form wizard that takes input data and templates it conditionally into the YAML presented to the user.  The form wizard has multiple pages to progress through: General, Architecture, Nodes, Networking, Advanced, and Preview.  The General page should have two input fields for "Cluster Name" and "Cluster Domain".  The Architecture page should have a dropdown for "Cluster Type" with options "Single Node", "Compact", and "Multi HA Cluster".  The Nodes page should present a button to add a Node(s) and define it's name with a text input field.  The Networking page needs a dropdown for "Load Balancer Type" with the options "Internal" and "External".  The Advanced page needs a textarea input field for "Additional Trusted Root CAs".  The Preview page should display all the input variables from the previous pages.
```

```
On the Node page of the Wizard, please add a dropdown between the text input and Add Node button.  This dropdown should only be shown if the Cluster Type dropdown on the Architecture page is equal to "Multi HA Cluster"
```

```
Thanks - add some logic to the Nodes page that disables the "Control Plane" option in the dropdown if there are already 5 Control Plane nodes defined
```

```
On the Node page, add logic to ensure node names are unique and not already present in the list
```

```
Add logic to the Nodes page that if the Cluster Type dropdown on the Architecture page is equal to "Single Node" that you cannot add more than one node to the list.  Repeat that logic to make sure if Cluster Type is equal to "Compact" that you cannot add more than 3 nodes to the list.
```

```
Add logic to the General page to make sure the Cluster Name follows the DNS label standard as defined in RFC 1123. This means the name must:

- contain at most 63 characters
- contain only lowercase alphanumeric characters or '-'
- start with an alphabetic character
- end with an alphanumeric character.

Alert the user if non-compliant input is detected.
```

```
Add logic to the General page to ensure the Cluster Domain is a valid domain - no need for a network test, just formatting.
```

```
Add logic to the Nodes page that after 3 Control Plane nodes have been added to the list, the default option in the Node Role dropdown is "Application"
```

```
Add a dropdown to the Architecture page for "Platform Type" - the options are "Bare Metal", "vSphere", and "None".  If Cluster Type is equal to "Single Node" the Platform Type dropdown must be set to "None" an disabled.
```

```
Add a text input to the Networking page titled "API VIP".  Add another text input below it for "Ingress VIP"
```

```
Add a list input on the Advanced page titled "NTP Servers".  Also a text input field titled "Total Cluster Network CIDR" with a default of "10.128.0.0/14", and a dropdown titled "Cluster Network Host Prefix" with options 8-26.
```

```
On the Advanced page, add a collapsed section with a set of input text fields for "HTTP Proxy", "HTTPS Proxy" and "No Proxy"
```

```
Add a confirmation popup to the Nodes page when clicking Remove from a listed node
```

```
On the Advanced page, add a collapsed section called "Cluster Subnets" and move the "Total Cluster network CIDR" and "Cluster Network Host Prefix" into that collapsed section.
```

```
On the Advanced page, in the Cluster Subnets collapsible section, add a text input field for "Service Network CIDR" with a default value of "172.30.0.0/16"
```

```
On the Networking page, add a set of list inputs for "DNS Servers" and "DNS Search Domains"
```

```
On the Advanced page, add a list input for "SSH Public Keys".
```

```
Add a page to the Wizard called "Disconnected" before the "Advanced" page.  On the Disconnected page, add a checkbox toggle titled "Configure Disconnected Registries".  When checked, it should show an input field for "Release Image Registry" with a default value of "quay.io/openshift-release-dev/ocp-release" and for "Platform Images Registry" with a default value of "quay.io/openshift-release-dev/ocp-v4.0-art-dev"
```

```
On the Advanced page, add a button to the SSH Public Keys input for a user to upload a public key file.
```

```
On the Disconnected page, add an object list input field for "Additional Registry Mappings" with object fields for "Source Registry" and "Mirror Registry"
```

```
On the Host Configuration page create a wide collaped card for all the Nodes added in the Nodes page.  When the card is expanded, it should have input fields for an object list of "Interfaces" with inputs/keys for "Device Name" and "MAC Address".
```

```
Add a page to the Wizard called "Host Networking".  Duplicate the Node card list from the "Host Configuration" page, including the defined list of defined Interfaces there.  For each Interface defined, create a collapsed section on the Host Networking page.  When expanded, it presents the following inputs:
- State, a dropdown with options "Up" or "Down"
- Type, a dropdown with options "Ethernet", "Bond", "Bridge", and "VLAN"
- Enable IPv4, a checkbox
- Enable IPv6, a checkbox
```

```
On the Host Networking page, on each defined Interface add an input field for "MTU" that defaults to 1500.
```

```
On the Host Networking page, when Enable IPv4 is checked, display another checkbox titled "Enable IPv4 DHCP" that is checked by default.  If unchecked, display an input for "IP Address" for the interface.
```

```
On the Host Networking page, add a dropdown button to add another Interface with options for "Bond", "VLAN", and "Bridge".
```

```
On the Host Networking page, hide the "Type" dropdown in the interface definition but keep the value present in the form state and display it in the interface section header.  If the interface was defined in the "Host Configuration" page the type should be "Ethernet".  The types of other added Interfaces should be what type is selected from the Add Interface dropdown.
```

```
On the Host Networking page, if the interface type is "Bond" then display a Ports multiselect input field.  When focusing on the field it should display the list of Ethernet type Interfaces defined on that host for selection.
```

```
On the Host Networking page, change the Ports input for the Bond interface types from a multi-select input field to a a text input field that displays the options with fuzzy matching.
```

```
On the Host Configuration page, only display the interfaces in the list for each host if it is an Ethernet type.
```

```
On the Host Networking page, if the interface type is "VLAN" then display a Base Interface dropdown.  The options are the other defined Interfaces on the host that are not a VLAN type.
```

```
On the Host Networking page, if a defined interface's State is Down, hide the remaining field inputs for that Interface.
```

```
On the Host Networking page, if an interface is a Bond type then display a dropdown for "Bonding Mode" with options "Active/Backup" and "LACP"
```

```
On the Host Networking page, for VLAN type interfaces, in the Base Interface dropdown list, exclude interfaces that are defined as Ports on any other Bond type interfaces.
```

```
On the Host Configuration page, when adding an interface, ensure the interface name is not already defined for that host.
```

```
On the Host Networking page, if the interface type is VLAN, then display an input for VLAN ID after the Base Interface dropdown.
```

```
On the Host Networking page, if the interface type is VLAN, reconstruct the interface name with the Base Interface name and VLAN ID in the format of "name.id"
```

```
On the Host Networking page, add a button to remove a defined interface unless it is an Ethernet type interface.
```

```
On the Host Networking page, if the Interface is a Bridge type display a Ports input, copy the logic of the Port input for a Bond type interface.
```

```
On the Host Networking page, for Bridge type interfaces, in the Ports input only show options that are not defined as Ports for other Bonds and Bridges.
```

```
On the Host Networking page, if the Interface type is a bridge, the Ports dropdown should include other bonds so long as they are not defined as ports in other bridge interfaces.
```

```
On the Host Networking page, if the Interface type is a VLAN, the Base Interface list should not include devices that are defined as ports in other Bond interfaces.
```

```
On the Networking page, if the Cluster Type is "Single Node" then hide the input fields for the API VIP and Ingress VIP.  Instead display an instruction to the user that the API VIP and Ingress VIP are not used with SIngle Node deployments and only the Node IP is needed.
```

```
On the Host Configuration page, for each defined host show a checkbox for "Installation Device: Auto" and when unchecked it displays a text input field for the installation device path.
```

```
On the Advanced page, add a checkbox input for "FIPS Mode" with the default being unchecked.
```

```
On the Host Networking page, display a prompt to the user to confirm Interface deletion
```

```
Change the remove confirmation logic in HostConfigurationStep.tsx to match the alerting logic present in the confirmRemoveNode functionality in NodesStep.tsx
```

```
In HostNetworkingStep.tsx add user confirmation when deleting an interface, copy the modal pattern from HostConfigurationStep.tsx
```