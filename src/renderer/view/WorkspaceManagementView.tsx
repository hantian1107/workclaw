import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Workspace } from '../service/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Plus, Link as LinkIcon, Briefcase } from 'lucide-react';

interface WorkspaceManagementViewProps {
  workspaces: Workspace[];
  onCreateWorkspace: (name: string) => void;
  onAddResource: (workspaceId: string, resource: string) => void;
}

const WorkspaceManagementView: React.FC<WorkspaceManagementViewProps> = ({
  workspaces,
  onCreateWorkspace,
  onAddResource
}) => {
  const navigate = useNavigate();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaces[0]?.id || '');
  const [resourcePath, setResourcePath] = useState('');

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
    }
  };

  const handleAddResource = () => {
    if (selectedWorkspaceId && resourcePath.trim()) {
      onAddResource(selectedWorkspaceId, resourcePath);
      setResourcePath('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 p-6 md:p-10 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full h-10 w-10 border-slate-200 shadow-sm hover:bg-slate-100"
            title="返回首页"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">工作空间管理</h2>
            <p className="text-sm text-slate-500">管理您的工作区和相关资源配置</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Left Column: List (Takes up more space) */}
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">现有工作空间</CardTitle>
                    <CardDescription>查看和管理已创建的所有工作空间</CardDescription>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    {workspaces.length} 个
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {workspaces.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workspaces.map(ws => (
                          <div
                            key={ws.id}
                            className="group flex items-start space-x-4 p-4 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50/50 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                              <span className="text-sm font-bold">{ws.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-900 truncate">{ws.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {ws.description || '暂无描述'}
                              </p>
                              <div className="mt-3 flex items-center space-x-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                  ID: {ws.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                        <Briefcase className="h-12 w-12 mb-4 opacity-20" />
                        <p>暂无工作空间，请在右侧创建</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Actions */}
          <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto">
            {/* Create Workspace */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-green-100/50 text-green-600 rounded-md">
                    <Plus className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">新建工作空间</CardTitle>
                </div>
                <CardDescription>创建一个新的项目集合以开始工作</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="输入名称，例如：项目 A"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    className="bg-slate-50/50"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCreate} 
                  disabled={!newWorkspaceName.trim()} 
                  className="w-full"
                >
                  创建工作空间
                </Button>
              </CardFooter>
            </Card>

            {/* Add Resource */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100/50 text-purple-600 rounded-md">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">关联资源</CardTitle>
                </div>
                <CardDescription>将文件或链接关联到现有工作空间</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">选择工作空间</label>
                    <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
                      <SelectTrigger className="w-full bg-slate-50/50">
                        <SelectValue placeholder="选择工作空间" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map((ws) => (
                          <SelectItem key={ws.id} value={ws.id}>
                            {ws.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">资源路径</label>
                    <Input
                      placeholder="输入路径或 URL"
                      value={resourcePath}
                      onChange={(e) => setResourcePath(e.target.value)}
                      className="bg-slate-50/50"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAddResource} 
                  disabled={!resourcePath.trim() || !selectedWorkspaceId} 
                  variant="outline"
                  className="w-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                >
                  添加资源
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManagementView;
